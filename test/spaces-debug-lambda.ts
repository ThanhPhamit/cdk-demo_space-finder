import { handler } from '../services/spaces/handler';

handler(
  {
    resource: '/spaces',
    path: '/spaces',
    httpMethod: 'POST',
    body: JSON.stringify({ location: 'New Location' }),
  } as any,
  {} as any,
);
