import type { AuthSession } from '../../domain/auth-session';
import { useAuthStore } from '../../store/use-auth-store';
import { resetSessionGenerationForTests } from '../session-operation';
import { performEmailSignIn, performEmailSignUp } from '../use-email-auth';

const SESSION: AuthSession = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
  tokenType: 'bearer',
  user: { id: 'user-1', name: 'メール 太郎', iconUrl: '' },
};

describe('use-email-auth', () => {
  const signUpWithEmail = jest.fn();
  const signInWithEmail = jest.fn();
  const savePersistedSession = jest.fn();

  const deps = () => ({
    authGateway: {
      signInWithGoogle: jest.fn(),
      signUpWithEmail,
      signInWithEmail,
      refreshAuthSession: jest.fn(),
      logoutAuthSession: jest.fn(),
    },
    sessionStore: {
      savePersistedSession,
      loadPersistedSession: jest.fn(),
      clearPersistedSession: jest.fn(),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetSessionGenerationForTests();
    useAuthStore.setState({ currentUser: null, accessToken: null, refreshToken: null });
    signUpWithEmail.mockResolvedValue({ status: 'session', session: SESSION });
    signInWithEmail.mockResolvedValue(SESSION);
    savePersistedSession.mockResolvedValue(undefined);
  });

  describe('performEmailSignIn', () => {
    it('サインイン成功時に backend 認証・永続化・ストア更新を行う', async () => {
      const result = await performEmailSignIn(
        { email: 'taro@example.com', password: 'password123' },
        deps(),
      );

      expect(signInWithEmail).toHaveBeenCalledWith({
        email: 'taro@example.com',
        password: 'password123',
      });
      expect(savePersistedSession).toHaveBeenCalledWith(SESSION);
      expect(useAuthStore.getState().currentUser).toEqual(SESSION.user);
      expect(result).toEqual(SESSION);
    });

    it('backend 認証失敗時はエラーを伝播し、ストアを更新しない', async () => {
      signInWithEmail.mockRejectedValue(new Error('invalid credentials'));

      await expect(
        performEmailSignIn({ email: 'taro@example.com', password: 'wrong' }, deps()),
      ).rejects.toThrow('invalid credentials');

      expect(savePersistedSession).not.toHaveBeenCalled();
      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('永続化失敗時はストアを更新しない', async () => {
      savePersistedSession.mockRejectedValue(new Error('secure-store failed'));

      await expect(
        performEmailSignIn({ email: 'taro@example.com', password: 'password123' }, deps()),
      ).rejects.toThrow('secure-store failed');

      expect(useAuthStore.getState().currentUser).toBeNull();
    });
  });

  describe('performEmailSignUp', () => {
    it('登録成功時に backend 認証・永続化・ストア更新を行う', async () => {
      const result = await performEmailSignUp(
        { email: 'taro@example.com', password: 'password123', name: 'メール 太郎' },
        deps(),
      );

      expect(signUpWithEmail).toHaveBeenCalledWith({
        email: 'taro@example.com',
        password: 'password123',
        name: 'メール 太郎',
      });
      expect(savePersistedSession).toHaveBeenCalledWith(SESSION);
      expect(useAuthStore.getState().currentUser).toEqual(SESSION.user);
      expect(result).toEqual({ status: 'session', session: SESSION });
    });

    it('メール確認待ちの場合は永続化もストア更新もせず confirmationRequired を返す', async () => {
      signUpWithEmail.mockResolvedValue({ status: 'confirmationRequired' });

      const result = await performEmailSignUp(
        { email: 'taro@example.com', password: 'password123', name: 'メール 太郎' },
        deps(),
      );

      expect(result).toEqual({ status: 'confirmationRequired' });
      expect(savePersistedSession).not.toHaveBeenCalled();
      expect(useAuthStore.getState().currentUser).toBeNull();
    });

    it('登録失敗時はエラーを伝播し、ストアを更新しない', async () => {
      signUpWithEmail.mockRejectedValue(new Error('email already registered'));

      await expect(
        performEmailSignUp(
          { email: 'taro@example.com', password: 'password123', name: 'メール 太郎' },
          deps(),
        ),
      ).rejects.toThrow('email already registered');

      expect(useAuthStore.getState().currentUser).toBeNull();
    });
  });
});
