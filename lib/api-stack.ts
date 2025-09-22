import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
    helloLambda: lambda.Function;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        // Create API Gateway
        const api = new apigateway.RestApi(this, 'SpaceApi', {
            restApiName: 'Space Service',
            description: 'API Gateway for Space Lambda function',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
            },
        });

        // Create Lambda integration
        const helloIntegration = new apigateway.LambdaIntegration(props.helloLambda, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
        });

        // Add resource and method
        const helloResource = api.root.addResource('hello');
        helloResource.addMethod('GET', helloIntegration);

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
            description: 'Hello endpoint URL',
        });
    }
}