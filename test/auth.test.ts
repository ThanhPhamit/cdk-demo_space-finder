import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AuthService } from './auth-services';

async function testAuth() {
  const authService = new AuthService();
  try {
    const signInOutput = await AuthService.signIn('phamvanthanh', 'XXXXXX');
    console.log('Sign-in successful:', signInOutput);

    const idToken = await authService.getIdToken();
    console.log('ID Token:', idToken);

    const credentials = await authService.generateTemporaryCredentials();
    console.log('Temporary AWS Credentials:', credentials);

    if (credentials) {
      const buckets = await listS3Buckets(credentials);
      console.log('S3 Buckets:', buckets.Buckets);
    }

    // Test S3 list buckets with the temporary credentials
  } catch (error) {
    console.error(error);
  }
}

async function listS3Buckets(credentials: AwsCredentialIdentity) {
  const client = new S3Client({
    credentials,
  });

  const command = new ListBucketsCommand({});
  return await client.send(command);
}

testAuth();
