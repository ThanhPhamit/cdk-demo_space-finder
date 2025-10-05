import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { postSpaces } from './post-spaces';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { getSpaces } from './get-spaces';
import { updateSpaces } from './update-spaces';
import { deleteSpaces } from './delete-spaces';
import { addCorsHeaders } from '../../util';
import { captureAWSv3Client, getSegment } from 'aws-xray-sdk-core';

const ddbClient = new DynamoDBClient({});
const tracedDdbClient = captureAWSv3Client(ddbClient);

const ddbDocClient = DynamoDBDocumentClient.from(tracedDdbClient);

async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult;

  const segment = getSegment();
  const subSeg = segment?.addNewSubsegment('MyLongCall');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  subSeg?.close();

  const subSeg2 = segment?.addNewSubsegment('MyLongCall');
  await new Promise((resolve) => setTimeout(resolve, 500));
  subSeg2?.close();

  try {
    switch (event.httpMethod) {
      case 'GET':
        response = await getSpaces(event, ddbDocClient);
        break;
      case 'POST':
        response = await postSpaces(event, ddbDocClient);
        break;
      case 'PUT':
        response = await updateSpaces(event, ddbDocClient);
        break;
      case 'DELETE':
        response = await deleteSpaces(event, ddbDocClient);
        break;
      default:
        response = {
          statusCode: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.error('Error occurred:', error);
    response = {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }

  // Add CORS headers to the response
  // Purpose: Adds CORS headers to the actual API response
  // - Your Lambda processes the request → Adds CORS headers to response
  // - Browser receives response with proper CORS headers
  // - Required for the browser to accept the response
  addCorsHeaders(response, event);
  return response;
}

export { handler };
