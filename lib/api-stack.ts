import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  spacesLambda: lambda.Function;
  userPool: IUserPool;
  cloudfrontDomain: string; // Required CloudFront domain from UIDeploymentStack
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Validate that CloudFront domain is provided
    if (!props.cloudfrontDomain || props.cloudfrontDomain.trim() === '') {
      throw new Error(
        'CloudFront domain is required for secure API CORS configuration',
      );
    }

    // TODO: Remove localhost origin
    // Use only the specific CloudFront domain for CORS
    const allowedOrigins = [
      `https://${props.cloudfrontDomain}`,
      // 'http://localhost:5173',
    ];

    // Create API Gateway with dynamic CORS
    const api = new apigateway.RestApi(this, 'SpaceApi', {
      restApiName: 'Space Service',
      description: 'API Gateway for Space Lambda function',
      defaultCorsPreflightOptions: {
        allowOrigins: allowedOrigins,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Add Cognito User Pool Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'SpaceUserPoolAuthorizer',
      {
        cognitoUserPools: [props.userPool],
        identitySource: 'method.request.header.Authorization',
      },
    );

    authorizer._attachToApi(api);

    const optionsWithAuth: apigateway.MethodOptions = {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: authorizer.authorizerId },
    };

    // Create Lambda integrations
    const spacesIntegration = new apigateway.LambdaIntegration(
      props.spacesLambda,
      {
        requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      },
    );

    // Add resources and methods - Remove resource-level CORS since we have API-level CORS
    const spacesResource = api.root.addResource('spaces');
    spacesResource.addMethod('GET', spacesIntegration, optionsWithAuth);
    spacesResource.addMethod('POST', spacesIntegration, optionsWithAuth);
    spacesResource.addMethod('PUT', spacesIntegration, optionsWithAuth);
    spacesResource.addMethod('DELETE', spacesIntegration, optionsWithAuth);

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'URL of the API Gateway',
    });

    // Output specific endpoints
    new cdk.CfnOutput(this, 'SpacesEndpoint', {
      value: `${api.url}spaces`,
      description: 'Spaces endpoint URL',
    });
  }
}
