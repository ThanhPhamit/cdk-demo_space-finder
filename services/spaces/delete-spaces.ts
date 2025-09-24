import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { SpaceValidator } from './validation';
import { hasAdminGroup } from '../../util';

export async function deleteSpaces(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient,
): Promise<APIGatewayProxyResult> {
  if (!hasAdminGroup(event)) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Forbidden' }),
    };
  }

  if (event.queryStringParameters && 'id' in event.queryStringParameters) {
    const spaceId = event.queryStringParameters['id'];

    if (!spaceId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Space ID is required' }),
      };
    }

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

    try {
      await ddbDocClient.send(
        new DeleteCommand({
          TableName: process.env.SPACES_TABLE_NAME,
          Key: {
            id: spaceId,
          },
        }),
      );

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Space with id ${spaceId} deleted successfully`,
        }),
      };
    } catch (error) {
      console.error('Error deleting space:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Internal Server Error' }),
      };
    }
  } else {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Space ID is required in query parameters',
      }),
    };
  }
}
