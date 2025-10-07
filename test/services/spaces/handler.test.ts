// Mock X-Ray SDK
jest.mock('aws-xray-sdk-core', () => ({
  captureAWSv3Client: jest.fn((client) => client),
  getSegment: jest.fn(() => ({
    addNewSubsegment: jest.fn(() => ({
      close: jest.fn(),
    })),
  })),
}));

// Create a mock send function that we can track
const mockSend = jest.fn().mockResolvedValue({
  Items: [
    {
      id: '123',
      location: 'Paris',
    },
  ],
});

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

const mockFrom = jest.fn((client) => ({
  send: mockSend,
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: mockFrom,
  },
  ScanCommand: jest.fn(),
}));

import { handler } from '../../../services/spaces/handler';

describe('Spaces handler test suite', () => {
  beforeAll(() => {
    process.env.CLOUDFRONT_DOMAIN = 'd123456.cloudfront.net';
  });

  afterAll(() => {
    delete process.env.CLOUDFRONT_DOMAIN;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Returns spaces from dynamoDb', async () => {
    const result = await handler(
      {
        httpMethod: 'GET',
      } as any,
      {} as any,
    );

    expect(result.statusCode).toBe(200);
    expect(result.headers).toBeDefined();
    expect(result.headers?.['Content-Type']).toBe('application/json');

    const expectedResult = [
      {
        id: '123',
        location: 'Paris',
      },
    ];
    const parsedResultBody = JSON.parse(result.body);
    expect(parsedResultBody).toEqual(expectedResult);

    // Verify DynamoDBDocumentClient.from was called to create the Document Client
    expect(mockFrom).toHaveBeenCalledTimes(1);

    // Verify the send method was called on the Document Client
    expect(mockSend).toHaveBeenCalledTimes(1);

    // Verify send was called with a command (ScanCommand for GET without id)
    expect(mockSend).toHaveBeenCalledWith(expect.any(Object));
  });
});
