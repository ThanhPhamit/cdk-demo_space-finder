import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../util';
import {
  Bucket,
  HttpMethods,
  IBucket,
  ObjectOwnership,
} from 'aws-cdk-lib/aws-s3';

interface DataStackProps extends StackProps {
  cloudfrontDomain: string; // Made required, not optional
}

export class DataStack extends Stack {
  public readonly spacesTable: ITable;
  public readonly deploymentBucket: IBucket;
  public readonly photosBucket: IBucket;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    this.spacesTable = new Table(this, 'SpacesTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'SpacesTable-' + suffix,
    });

    this.deploymentBucket = new Bucket(this, 'SpacesFinderUiDeploymentBucket', {
      bucketName: `space-finder-ui-deployment-bucket-${suffix}`,
    });

    // Validate that CloudFront domain is provided
    if (!props.cloudfrontDomain) {
      throw new Error(
        'CloudFront domain is required for CORS configuration. Cannot allow all origins (*) for security reasons.',
      );
    }

    // TODO: Remove localhost origin in production
    // Use the specific CloudFront domain for CORS
    const allowedOrigins = [
      `https://${props.cloudfrontDomain}`,
      // 'http://localhost:5173',
    ];

    this.photosBucket = new Bucket(this, 'SpacesPhotosBucket', {
      bucketName: `space-finder-photos-bucket-${suffix}`,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: allowedOrigins,
          allowedHeaders: ['*'],
        },
      ],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
    });

    new CfnOutput(this, 'SpaceFinderPhotosBucketName', {
      value: this.photosBucket.bucketName,
      description: 'The name of the S3 bucket for storing space photos',
    });
  }
}
