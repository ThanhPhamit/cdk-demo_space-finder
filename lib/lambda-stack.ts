import * as cdk from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Effect } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

interface LambdaStackProps extends cdk.StackProps {
  spacesTable: ITable;
  cloudfrontDomain: string; // Required CloudFront domain for CORS
}

export class LambdaStack extends cdk.Stack {
  public readonly spacesLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Validate that CloudFront domain is provided
    if (!props.cloudfrontDomain || props.cloudfrontDomain.trim() === '') {
      throw new Error(
        'CloudFront domain is required for Lambda stack configuration',
      );
    }

    this.spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, '..', 'services', 'spaces', 'handler.ts'),
      description: 'A simple Lambda function that logs events',
      timeout: cdk.Duration.minutes(5),
      environment: {
        SPACES_TABLE_NAME: props.spacesTable.tableName,
        CLOUDFRONT_DOMAIN: props.cloudfrontDomain,
      },
    });

    this.spacesLambda.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:PutItem',
          'dynamodb:GetItem',
          'dynamodb:Scan',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
        ],
        resources: [props.spacesTable.tableArn],
      }),
    );

    // Output Lambda function ARNs
    new cdk.CfnOutput(this, 'SpacesLambdaFunctionArn', {
      value: this.spacesLambda.functionArn,
      description: 'ARN of the Spaces Lambda function',
    });

    // Output CloudWatch Log Group Names
    new cdk.CfnOutput(this, 'SpacesLambdaLogGroup', {
      value: this.spacesLambda.logGroup.logGroupName,
      description: 'CloudWatch Log Group for Spaces Lambda',
    });

    // Output CloudWatch Log Group ARNs
    new cdk.CfnOutput(this, 'SpacesLambdaLogGroupArn', {
      value: this.spacesLambda.logGroup.logGroupArn,
      description: 'CloudWatch Log Group ARN for Spaces Lambda',
    });
  }
}
