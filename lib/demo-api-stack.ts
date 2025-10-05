import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface DemoApiStackProps extends cdk.StackProps {
  helloLambda: lambda.Function;
  pythonLambda: lambda.Function;
}

export class DemoApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DemoApiStackProps) {
    super(scope, id, props);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'SpaceApi', {
      restApiName: 'Demo Space Service',
      description: 'API Gateway for Demo Space Lambda function',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Create Lambda integrations
    const helloIntegration = new apigateway.LambdaIntegration(
      props.helloLambda,
      {
        requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      },
    );

    const pythonIntegration = new apigateway.LambdaIntegration(
      props.pythonLambda,
      {
        requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      },
    );

    // Add resources and methods
    const helloResource = api.root.addResource('hello');
    helloResource.addMethod('GET', helloIntegration);

    const helloPythonResource = api.root.addResource('hello-python');
    helloPythonResource.addMethod('GET', pythonIntegration);

    // Add a catch-all proxy resource for additional paths
    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', helloIntegration);

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'URL of the API Gateway',
    });

    // Output specific endpoints
    new cdk.CfnOutput(this, 'HelloEndpoint', {
      value: `${api.url}hello`,
      description: 'Hello TypeScript endpoint URL',
    });

    new cdk.CfnOutput(this, 'HelloPythonEndpoint', {
      value: `${api.url}hello-python`,
      description: 'Hello Python endpoint URL',
    });
  }
}
