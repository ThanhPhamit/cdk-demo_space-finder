import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { SpaceValidator, Space } from './validation';
import { randomUUID } from 'crypto';

export async function postSpaces(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient,
): Promise<APIGatewayProxyResult> {
  try {
    // Validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const requestBody = JSON.parse(event.body);

    // Validate required fields for space creation
    const requiredFields = ['location', 'ward'];
    const missingFields = requiredFields.filter((field) => !requestBody[field]);

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Missing required fields',
          missingFields,
        }),
      };
    }

    const spaceData: Partial<Space> = {
      id: randomUUID(),
      location: requestBody.location,
      ward: requestBody.ward,
      photoUrl: requestBody.photoUrl,
    };

    // Sanitize input data
    const sanitizedSpace = SpaceValidator.sanitizeSpace(spaceData);

    // Validate the complete space data
    const validation = SpaceValidator.validateCompleteSpace(sanitizedSpace);

    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Validation failed',
          errors: validation.errors,
        }),
      };
    }

    const result = await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.SPACES_TABLE_NAME,
        Item: sanitizedSpace,
      }),
    );

    console.log('DynamoDB PutItem result:', result);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Space created successfully',
        spaceId: spaceData.id,
        space: sanitizedSpace,
      }),
    };
  } catch (error) {
    console.error('Error creating space:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Invalid JSON in request body' }),
      };
    }

    // Handle other errors
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
