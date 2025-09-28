import { Fn, Stack } from 'aws-cdk-lib';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export function getSuffixFromStack(stack: Stack): string {
  const shortStackId = Fn.select(2, Fn.split('/', stack.stackId));
  return Fn.select(4, Fn.split('-', shortStackId));
}

export function hasAdminGroup(event: APIGatewayProxyEvent): boolean {
  const claims = event.requestContext.authorizer?.claims;
  return claims?.['cognito:groups']?.includes('admins') ?? false;
}

export function addCorsHeaders(
  arg: APIGatewayProxyResult,
  event?: APIGatewayProxyEvent,
) {
  if (!arg.headers) {
    arg.headers = {};
  }

  // Validate that CloudFront domain is configured
  if (
    !process.env.CLOUDFRONT_DOMAIN ||
    process.env.CLOUDFRONT_DOMAIN.trim() === ''
  ) {
    throw new Error(
      'CLOUDFRONT_DOMAIN environment variable is required for secure CORS configuration',
    );
  }

  // TODO: Remove localhost origin in production
  // Allowed origins: Only CloudFront domain
  const allowedOrigins = [
    `https://${process.env.CLOUDFRONT_DOMAIN}`,
    // 'http://localhost:5173',
  ];

  // Get the origin from the request
  const origin = event?.headers?.origin || event?.headers?.Origin;

  // Set CORS origin - only allow the CloudFront domain
  if (origin && allowedOrigins.includes(origin)) {
    // Request is coming from our allowed CloudFront domain
    arg.headers['Access-Control-Allow-Origin'] = origin;
  } else {
    // Always use the CloudFront domain for CORS, regardless of the requesting origin
    // This ensures we never accidentally allow unauthorized domains
    arg.headers['Access-Control-Allow-Origin'] = allowedOrigins[0];
  }

  arg.headers['Access-Control-Allow-Methods'] =
    'GET, POST, PUT, DELETE, OPTIONS';
  arg.headers['Access-Control-Allow-Headers'] =
    'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token';
  arg.headers['Access-Control-Allow-Credentials'] = 'true';
}
