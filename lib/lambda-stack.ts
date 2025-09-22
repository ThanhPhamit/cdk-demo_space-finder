import * as cdk from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface LambdaStackProps extends cdk.StackProps {
  spacesTable: ITable;
}

export class LambdaStack extends cdk.Stack {
  public readonly helloLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: LambdaStackProps) {
    super(scope, id, props);

    this.helloLambda = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'hello.main',
      code: lambda.Code.fromAsset('lambda'),
      description: 'A simple Lambda function that logs events',
      timeout: cdk.Duration.minutes(5),
      environment: {
        SPACES_TABLE_NAME: props?.spacesTable.tableName || '',
      },
    });

    // Output the function ARN
    new cdk.CfnOutput(this, 'HelloLambdaFunctionArn', {
      value: this.helloLambda.functionArn,
      description: 'ARN of the Hello Lambda function',
    });
  }
}
