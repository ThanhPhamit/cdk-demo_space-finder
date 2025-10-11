import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

interface CicdStackProps extends cdk.StackProps {}

export class CicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CicdStackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CICDPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          'ThanhPhamit/cdk-demo_space-finder',
          'chore/cicd/cicd-pratice',
        ),
        commands: [
          // use yarn to install reproducibly, build, and run cdk synth via yarn
          'yarn install --frozen-lockfile',
          'yarn tsc --skipLibCheck',  // Skip lib check to avoid @smithy/core type errors
          'yarn cdk synth',
        ],
        primaryOutputDirectory: 'cdk.out',
      }),
    });
  }
}
