import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../util';
import { join } from 'path';
import { existsSync } from 'fs';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

interface UiDeploymentStackProps extends StackProps {
  deploymentBucket: IBucket;
}

export class UiDeploymentStack extends Stack {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: UiDeploymentStackProps) {
    super(scope, id, props);

    const uiDir = join(__dirname, '..', '..', 'space-finder-frontend', 'dist');
    if (!existsSync(uiDir)) {
      throw new Error(
        `UI directory does not exist: ${uiDir}. Please build the frontend first.`,
      );
    }

    new BucketDeployment(this, 'SpacesFinderUiDeployment', {
      destinationBucket: props.deploymentBucket,
      sources: [Source.asset(uiDir)],
    });

    const s3Origin = new S3Origin(props.deploymentBucket);

    this.distribution = new Distribution(this, 'SpacesFinderDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: s3Origin,
      },
    });

    new CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.domainName,
      description: 'The domain name of the CloudFront distribution',
    });
  }
}
