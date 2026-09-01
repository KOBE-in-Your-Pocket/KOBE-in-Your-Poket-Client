import type { AuthSession, EmailSignUpResult, PersistedSession } from './auth-session';

/** backend 認証 API へのアクセスを抽象化するポート。 */
export type AuthGateway = {
  signInWithGoogle(idToken: string): Promise<AuthSession>;
  signUpWithEmail(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<EmailSignUpResult>;
  signInWithEmail(params: { email: string; password: string }): Promise<AuthSession>;
  refreshAuthSession(refreshToken: string): Promise<AuthSession>;
  logoutAuthSession(accessToken: string): Promise<void>;
};

/** セッションの永続化を抽象化するポート。 */
export type SessionStore = {
  savePersistedSession(session: AuthSession): Promise<void>;
  loadPersistedSession(): Promise<PersistedSession | null>;
  clearPersistedSession(): Promise<void>;
};
