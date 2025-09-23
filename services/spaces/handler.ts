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

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  try {
    switch (event.httpMethod) {
      case 'GET':
        return getSpaces(event, ddbDocClient);
      case 'POST':
        return postSpaces(event, ddbDocClient);
      case 'PUT':
        return updateSpaces(event, ddbDocClient);
      case 'DELETE':
        return deleteSpaces(event, ddbDocClient);
      default:
        return {
          statusCode: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
}

export { handler };
