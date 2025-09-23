import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SpaceValidator, Space } from './validation';

export async function updateSpaces(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBDocumentClient,
): Promise<APIGatewayProxyResult> {
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

    if (event.body) {
      try {
        const requestBody = JSON.parse(event.body);

        // Filter out non-updatable fields (id should not be updated)
        const allowedFields = ['location', 'ward', 'photoUrl'];
        const updateData: Partial<Space> = {};

        for (const [key, value] of Object.entries(requestBody)) {
          if (allowedFields.includes(key) && typeof value === 'string') {
            updateData[key as keyof Space] = value;
          }
        }

        const requestBodyKeys = Object.keys(updateData);

        if (requestBodyKeys.length === 0) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message:
                'Request body must contain at least one valid attribute to update (location, ward, photoUrl)',
            }),
          };
        }

        // Sanitize input data
        const sanitizedData = SpaceValidator.sanitizeSpace(updateData);

        // Validate the update data
        const validation = SpaceValidator.validateSpace(sanitizedData);

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

        // Build update expression dynamically for multiple attributes
        const updateExpressions: string[] = [];
        const expressionAttributeNames: { [key: string]: string } = {};
        const expressionAttributeValues: { [key: string]: any } = {};

        Object.keys(sanitizedData).forEach((key, index) => {
          const attributeName = `#attr${index}`;
          const attributeValue = `:val${index}`;

          updateExpressions.push(`${attributeName} = ${attributeValue}`);
          expressionAttributeNames[attributeName] = key;
          expressionAttributeValues[attributeValue] =
            sanitizedData[key as keyof Space];
        });

        const updateExpression = `set ${updateExpressions.join(', ')}`;

        const updateResult = await ddbDocClient.send(
          new UpdateCommand({
            TableName: process.env.SPACES_TABLE_NAME,
            Key: {
              id: spaceId,
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW', // Returns all attributes of the item after update
          }),
        );

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateResult.Attributes),
        };
      } catch (error) {
        console.error('Error updating space:', error);
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
        body: JSON.stringify({ message: 'Request body is required' }),
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
