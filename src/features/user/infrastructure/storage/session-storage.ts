import * as SecureStore from 'expo-secure-store';

import type { AuthSession, PersistedSession } from '../../domain/auth-session';

/**
 * セッションの永続化（expo-secure-store）。
 *
 * トークンは平文保存の AsyncStorage ではなく Keychain（secure-store）に置く。
 * accessToken は短命で、起動時に /auth/refresh で再発行するため永続化しない
 * （secure-store の値サイズ制約（iOS で約 2KB）を超えないようにする意図もある）。
 */

const SESSION_KEY = 'auth.session';

/** セッションを保存する。ログイン成功時・リフレッシュ成功時に呼ぶ。 */
export async function savePersistedSession(session: AuthSession): Promise<void> {
  const persisted: PersistedSession = {
    refreshToken: session.refreshToken,
    user: session.user,
  };
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(persisted));
}

/** 保存済みセッションを読み出す。未保存・パース不能の場合は null を返す。 */
export async function loadPersistedSession(): Promise<PersistedSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (raw === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedSession;
    if (typeof parsed?.refreshToken !== 'string' || typeof parsed.user?.id !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** 保存済みセッションを削除する。ログアウト時・トークン失効時に呼ぶ。 */
export async function clearPersistedSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
