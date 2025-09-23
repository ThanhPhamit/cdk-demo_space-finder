import * as cdk from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Construct } from 'constructs';
import { join } from 'path';

interface LambdaStackProps extends cdk.StackProps {
  spacesTable: ITable;
}

export class LambdaStack extends cdk.Stack {
  public readonly helloLambda: lambda.Function;
  public readonly pythonLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: LambdaStackProps) {
    super(scope, id, props);

    this.helloLambda = new NodejsFunction(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, '..', 'lambda', 'nodejs', 'hello.ts'),
      description: 'A simple Lambda function that logs events',
      timeout: cdk.Duration.minutes(5),
      environment: {
        SPACES_TABLE_NAME: props?.spacesTable.tableName || '',
      },
    });

    // Python Lambda function
    this.pythonLambda = new PythonFunction(this, 'PythonHelloLambda', {
      runtime: lambda.Runtime.PYTHON_3_12,
      entry: join(__dirname, '..', 'lambda', 'python'),
      handler: 'handler',
      description: 'A simple Python Lambda function',
      timeout: cdk.Duration.minutes(5),
      environment: {
        SPACES_TABLE_NAME: props?.spacesTable.tableName || '',
      },
    });

    // Output the function ARNs
    new cdk.CfnOutput(this, 'HelloLambdaFunctionArn', {
      value: this.helloLambda.functionArn,
      description: 'ARN of the Hello Lambda function',
    });

    new cdk.CfnOutput(this, 'PythonLambdaFunctionArn', {
      value: this.pythonLambda.functionArn,
      description: 'ARN of the Python Hello Lambda function',
    });
  }
}
