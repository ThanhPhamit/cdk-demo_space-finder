import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface AuthStackProps extends cdk.StackProps {}

export class AuthStack extends cdk.Stack {
  public userPool: UserPool;
  private userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.createUserPool();
    this.createUserPoolClient();
    this.createAdminGroup();
  }

  private createUserPool() {
    this.userPool = new UserPool(this, 'SpaceUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: true },
    });

    new cdk.CfnOutput(this, 'SpaceUserPoolId', {
      value: this.userPool.userPoolId,
    });
  }

  private createUserPoolClient() {
    this.userPoolClient = new UserPoolClient(this, 'SpaceUserPoolClient', {
      userPool: this.userPool,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    });

    new cdk.CfnOutput(this, 'SpaceUserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    });
  }

  private createAdminGroup() {
    new CfnUserPoolGroup(this, 'SpaceAdminGroup', {
      groupName: 'admins',
      userPoolId: this.userPool.userPoolId,
    });
  }
}
