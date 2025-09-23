import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

async function handler(event: APIGatewayProxyEvent, context: Context) {
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
