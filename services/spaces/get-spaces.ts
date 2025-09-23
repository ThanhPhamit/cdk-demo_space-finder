import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SpaceValidator } from './validation';

export async function getSpaces(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient,
): Promise<APIGatewayProxyResult> {
  try {
    const spaceId = event.queryStringParameters?.id;

    if (spaceId) {
      // Validate the space ID format
      const idValidation = SpaceValidator.validateId(spaceId);
      if (!idValidation.isValid) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Invalid space ID format',
            errors: idValidation.errors,
          }),
        };
      }

      // Get specific space by ID
      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: process.env.SPACES_TABLE_NAME,
          Key: { id: spaceId },
        }),
      );

      if (!result.Item) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Space not found' }),
        };
      }

      // No need to unmarshall with DocumentClient
      const space = result.Item;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(space),
      };
    } else {
      // Get all spaces
      const result = await ddbDocClient.send(
        new ScanCommand({
          TableName: process.env.SPACES_TABLE_NAME,
        }),
      );

      // No need to unmarshall with DocumentClient
      const spaces = result.Items || [];

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spaces),
      };
    }
  } catch (error) {
    console.error('Error getting spaces:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
