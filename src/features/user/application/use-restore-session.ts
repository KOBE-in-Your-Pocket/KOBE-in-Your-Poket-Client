import { useEffect } from 'react';

import { AuthApiError, refreshAuthSession } from '../infrastructure/api/auth-api';
import {
  clearPersistedSession,
  loadPersistedSession,
  savePersistedSession,
} from '../infrastructure/storage/session-storage';
import { useAuthStore } from '../store/use-auth-store';

/**
 * secure-store に保存済みのセッションを復元する。
 *
 * 保存済みのリフレッシュトークンを /auth/refresh に渡して有効性を確認し、
 * 成功したら新しいセッションでストアと保存を更新する（トークンはローテーションされる）。
 * backend がエラーを返した場合（失効）は保存分を破棄して未ログインに戻す。
 * ネットワークエラー等では保存分を残し、次回起動時に再試行する。
 */
export async function restoreSession(): Promise<void> {
  const persisted = await loadPersistedSession();
  if (!persisted) {
    return;
  }

  try {
    const session = await refreshAuthSession(persisted.refreshToken);
    useAuthStore.getState().setSession(session);
    await savePersistedSession(session);
  } catch (error) {
    if (error instanceof AuthApiError) {
      await clearPersistedSession();
    }
  }
}

/** アプリ起動時に一度だけ保存済みセッションの復元を試みるフック。 */
export function useRestoreSession(): void {
  useEffect(() => {
    void restoreSession();
  }, []);
}
