import { Amplify } from 'aws-amplify';
import { SignInOutput, fetchAuthSession, signIn } from '@aws-amplify/auth';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const awsRegion = process.env.AWS_REGION;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_iheEVrn4d',
      userPoolClientId: '3u93ekf52ot4851ff7a83lp9el',
      identityPoolId: 'ap-southeast-1:31c3f159-50c1-4753-bac2-d7540a0142ec',
    },
  },
});

export class AuthService {
  static async signIn(
    username: string,
    password: string,
  ): Promise<SignInOutput> {
    try {
      const signInOutput: SignInOutput = await signIn({
        username,
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      });
      return signInOutput;
    } catch (error) {
      throw new Error(`Sign-in failed: ${error}`);
    }
  }

  public async getIdToken(): Promise<string | undefined> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (error) {
      throw new Error(`Failed to get ID token: ${error}`);
    }
  }

  public async generateTemporaryCredentials() {
    const idToken = await this.getIdToken();
    if (!idToken) {
      throw new Error('ID token is not available');
    }

    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/ap-southeast-1_iheEVrn4d`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        identityPoolId: 'ap-southeast-1:31c3f159-50c1-4753-bac2-d7540a0142ec',
        logins: {
          [cognitoIdentityPool]: idToken,
        },
      }),
    });

    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
  }
}
