#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { DemoLambdaStack } from '../lib/demo-lambda-stack';
import { DemoApiStack } from '../lib/demo-api-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const env = {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
};

const dataStack = new DataStack(app, 'DataStack', { env });

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

// Spaces API
const lambdaStack = new LambdaStack(app, 'SpacesLambdaStack', {
  spacesTable: dataStack.spacesTable,
  env,
});

new ApiStack(app, 'SpacesApiStack', {
  spacesLambda: lambdaStack.spacesLambda,
  env,
});
