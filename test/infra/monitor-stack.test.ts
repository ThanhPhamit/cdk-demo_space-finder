import { App } from 'aws-cdk-lib';
import { MonitorStack } from '../../lib/monitor-stack';
import { Capture, Match, Template } from 'aws-cdk-lib/assertions';
import 'dotenv/config';

const env = {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
};

describe('Initial Test', () => {
  let monitorStackTemplate: Template;
  beforeAll(() => {
    if (!env.account || !env.region) {
      throw new Error(
        'AWS_ACCOUNT_ID and AWS_REGION environment variables must be set for tests',
      );
    }

    const testApp = new App({
      outdir: 'cdk.out',
    });

    const monitorStack = new MonitorStack(testApp, 'MonitorStack', { env });
    monitorStackTemplate = Template.fromStack(monitorStack);
  });

  test('Lambda function properties', () => {
    monitorStackTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
    });
  });

  test('SNS topic properties', () => {
    monitorStackTemplate.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: 'AlarmTopic',
      TopicName: 'AlarmTopic',
    });
  });

  // CDK matcher
  test('SNS subscription properties - with matchers', () => {
    monitorStackTemplate.hasResourceProperties(
      'AWS::SNS::Subscription',
      Match.objectEquals({
        Protocol: 'lambda',
        TopicArn: {
          Ref: Match.stringLikeRegexp('AlarmTopic'),
        },
        Endpoint: {
          'Fn::GetAtt': [Match.stringLikeRegexp('WebHookLambda'), 'Arn'],
        },
      }),
    );
  });

  test('SNS subscription properties - with exact values', () => {
    const snsTopic = monitorStackTemplate.findResources('AWS::SNS::Topic');
    const snsTopicName = Object.keys(snsTopic)[0];

    const lambdaFunction = monitorStackTemplate.findResources(
      'AWS::Lambda::Function',
    );
    const lambdaFunctionName = Object.keys(lambdaFunction)[0];

    monitorStackTemplate.hasResourceProperties(
      'AWS::SNS::Subscription',
      Match.objectEquals({
        Protocol: 'lambda',
        TopicArn: {
          Ref: snsTopicName,
        },
        Endpoint: {
          'Fn::GetAtt': [lambdaFunctionName, 'Arn'],
        },
      }),
    );
  });

  // Using SDK Captures
  test('CloudWatch alarm actions', () => {
    const alarmActionsCapture = new Capture();
    monitorStackTemplate.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmActions: alarmActionsCapture,
    });

    expect(alarmActionsCapture.asArray()).toEqual([
      {
        Ref: expect.stringMatching(/^AlarmTopic/),
      },
    ]);
  });

  // Snapshot testing
  test('Monitor stack snapshot', () => {
    expect(monitorStackTemplate.toJSON()).toMatchSnapshot();
  });

  test('Lambda stack snapshot', () => {
    const lambda = monitorStackTemplate.findResources('AWS::Lambda::Function');
    expect(lambda).toMatchSnapshot();
  });

  test('SNS Topic stack snapshot', () => {
    const snsTopic = monitorStackTemplate.findResources('AWS::SNS::Topic');
    expect(snsTopic).toMatchSnapshot();
  });
});
