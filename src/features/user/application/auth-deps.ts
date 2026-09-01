import type { AuthGateway, SessionStore } from '../domain/auth-ports';
import {
  logoutAuthSession,
  refreshAuthSession,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '../infrastructure/api/auth-api';
import {
  clearPersistedSession,
  loadPersistedSession,
  savePersistedSession,
} from '../infrastructure/storage/session-storage';

/** 本番用の認証 API ゲートウェイ。 */
export const defaultAuthGateway: AuthGateway = {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  refreshAuthSession,
  logoutAuthSession,
};

/** 本番用のセッション永続化ストア。 */
export const defaultSessionStore: SessionStore = {
  savePersistedSession,
  loadPersistedSession,
  clearPersistedSession,
};
