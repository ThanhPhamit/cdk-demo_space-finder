#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { DemoLambdaStack } from '../lib/demo-lambda-stack';
import { DemoApiStack } from '../lib/demo-api-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiStack } from '../lib/api-stack';
import { AuthStack } from '../lib/auth-stack';
import { UiDeploymentStack } from '../lib/ui-deployment-stack';
import { MonitorStack } from '../lib/monitor-stack';
import { CicdStack } from '../lib/cicd-stack';

const app = new cdk.App();

const env = {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
};

// Get CloudFront domain from context or use the known value
const cloudfrontDomain =
  app.node.tryGetContext('cloudfrontDomain') || 'd3mt1c4ughk569.cloudfront.net';

// Validate CloudFront domain is provided
if (!cloudfrontDomain || cloudfrontDomain.trim() === '') {
  throw new Error(
    'CloudFront domain must be provided for secure CORS configuration',
  );
}

const dataStack = new DataStack(app, 'DataStack', {
  cloudfrontDomain,
  env,
});

// Demo purposes only
const demoLambdaStack = new DemoLambdaStack(app, 'LambdaStack', {
  spacesTable: dataStack.spacesTable,
  env,
});

new DemoApiStack(app, 'ApiStack', {
  helloLambda: demoLambdaStack.helloLambda,
  pythonLambda: demoLambdaStack.pythonLambda,
  env,
});

const authStack = new AuthStack(app, 'AuthStack', {
  photosBucket: dataStack.photosBucket,
  env,
});

const uiDeploymentStack = new UiDeploymentStack(
  app,
  'SpacesUiDeploymentStack',
  {
    deploymentBucket: dataStack.deploymentBucket,
    env,
  },
);

// Spaces API
const lambdaStack = new LambdaStack(app, 'SpacesLambdaStack', {
  spacesTable: dataStack.spacesTable,
  cloudfrontDomain: uiDeploymentStack.distribution.distributionDomainName,
  env,
});

new ApiStack(app, 'SpacesApiStack', {
  spacesLambda: lambdaStack.spacesLambda,
  userPool: authStack.userPool,
  cloudfrontDomain: uiDeploymentStack.distribution.distributionDomainName,
  env,
});

new MonitorStack(app, 'MonitorStack', { env });

// CICD Stack
new CicdStack(app, 'CICDStack', { env });
