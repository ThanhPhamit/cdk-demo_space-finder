import { Amplify } from 'aws-amplify';
import { SignInOutput, fetchAuthSession, signIn } from '@aws-amplify/auth';

const awsRegion = process.env.AWS_REGION;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_iheEVrn4d',
      userPoolClientId: '3u93ekf52ot4851ff7a83lp9el',
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
}
