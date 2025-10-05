import * as cdk from 'aws-cdk-lib';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { join } from 'path';

interface MonitorStackProps extends cdk.StackProps {}

export class MonitorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitorStackProps) {
    super(scope, id, props);

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
      throw new Error(
        'SLACK_WEBHOOK_URL environment variable is required for MonitorStack',
      );
    }

    const webHookLambda = new NodejsFunction(this, 'WebHookLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, '..', 'services', 'monitor', 'handler.ts'),
      environment: {
        SLACK_WEBHOOK_URL: slackWebhookUrl,
      },
    });

    const alarmTopic = new Topic(this, 'AlarmTopic', {
      displayName: 'AlarmTopic',
      topicName: 'AlarmTopic',
    });

    alarmTopic.addSubscription(new LambdaSubscription(webHookLambda));

    const spacesApi4xxAlarm = new cdk.aws_cloudwatch.Alarm(
      this,
      'SpacesApi4xxAlarm',
      {
        metric: new cdk.aws_cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: '4XXError',
          dimensionsMap: {
            ApiName: 'Space Service',
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
        threshold: 1,
        evaluationPeriods: 1,
        alarmDescription: 'Alarm for 4XX errors in Space Service API Gateway',
        alarmName: 'SpacesApi4xxAlarm',
      },
    );

    const spacesApi5xxAlarm = new cdk.aws_cloudwatch.Alarm(
      this,
      'SpacesApi5xxAlarm',
      {
        metric: new cdk.aws_cloudwatch.Metric({
          namespace: 'AWS/ApiGateway',
          metricName: '5XXError',
          dimensionsMap: {
            ApiName: 'Space Service',
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
        threshold: 1,
        evaluationPeriods: 1,
        alarmDescription: 'Alarm for 5XX errors in Space Service API Gateway',
        alarmName: 'SpacesApi5xxAlarm',
      },
    );

    const topicAction = new SnsAction(alarmTopic);

    spacesApi4xxAlarm.addAlarmAction(topicAction);
    spacesApi4xxAlarm.addOkAction(topicAction);
    spacesApi5xxAlarm.addAlarmAction(topicAction);
  }
}
