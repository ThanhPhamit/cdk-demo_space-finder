import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  spacesLambda: lambda.Function;
  userPool: IUserPool;
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

    // Add resources and methods
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
