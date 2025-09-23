import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

async function handler(event: APIGatewayProxyEvent, context: Context) {
  // Example: List S3 buckets (requires appropriate IAM permissions)
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log('S3 Buckets:', data.Buckets);
  } catch (err) {
    console.error('Error listing S3 buckets:', err);
  }

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `SPACE_TABLE_NAME is ${
        process.env.SPACES_TABLE_NAME
      } with uuid is ${uuidv4()}`,
      event: event,
    }),
  };

  console.log('Event: ', event);

  return response;
}

export { handler };
