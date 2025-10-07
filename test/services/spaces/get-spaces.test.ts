import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { getSpaces } from '../../../services/spaces/get-spaces';

const someItems = {
  Items: [
    {
      id: '123',
      location: 'Paris',
    },
  ],
};

const someItem = {
  Item: {
    id: '123',
    location: 'Paris',
  },
};

describe('GetSpaces test suite', () => {
  const ddbClientMock = {
    send: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return spaces if no queryStringParameters', async () => {
    ddbClientMock.send.mockResolvedValueOnce(someItems);
    const getResult = await getSpaces({} as any, ddbClientMock as any);
    const expectedResult = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          id: '123',
          location: 'Paris',
        },
      ]),
    };
    expect(getResult).toEqual(expectedResult);
  });

  test('should return all spaces if queryStringParameters without id', async () => {
    ddbClientMock.send.mockResolvedValueOnce(someItems);
    const getResult = await getSpaces(
      {
        queryStringParameters: {
          notId: '123',
        },
      } as any,
      ddbClientMock as any,
    );
    const expectedResult = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          id: '123',
          location: 'Paris',
        },
      ]),
    };
    expect(getResult).toEqual(expectedResult);
  });

  test('should return 404 if space with id not found', async () => {
    ddbClientMock.send.mockResolvedValueOnce({});
    const getResult = await getSpaces(
      {
        queryStringParameters: {
          id: '123',
        },
      } as any,
      ddbClientMock as any,
    );
    const expectedResult = {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Space not found' }),
    };
    expect(getResult).toEqual(expectedResult);
  });

  test('should return 200 if queryStringParameters with found id', async () => {
    ddbClientMock.send.mockResolvedValueOnce(someItem);
    const getResult = await getSpaces(
      {
        queryStringParameters: {
          id: '123',
        },
      } as any,
      ddbClientMock as any,
    );
    const expectedResult = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '123',
        location: 'Paris',
      }),
    };
    expect(getResult).toEqual(expectedResult);
    expect(ddbClientMock.send).toHaveBeenCalledWith(expect.any(GetCommand));
    const getCommandInput = (ddbClientMock.send.mock.calls[0][0] as GetCommand)
      .input;
    expect(getCommandInput.TableName).toBeUndefined();
    expect(getCommandInput.Key).toEqual({
      id: '123',
    });
  });
});
