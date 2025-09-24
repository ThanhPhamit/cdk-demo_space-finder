import { Fn, Stack } from 'aws-cdk-lib';
import { APIGatewayProxyEvent } from 'aws-lambda';

export function getSuffixFromStack(stack: Stack): string {
  const shortStackId = Fn.select(2, Fn.split('/', stack.stackId));
  return Fn.select(4, Fn.split('-', shortStackId));
}

export function hasAdminGroup(event: APIGatewayProxyEvent): boolean {
  const claims = event.requestContext.authorizer?.claims;
  return claims?.['cognito:groups']?.includes('admins') ?? false;
}
