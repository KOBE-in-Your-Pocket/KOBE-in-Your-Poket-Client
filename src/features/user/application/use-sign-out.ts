import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';

import { logoutAuthSession } from '../infrastructure/api/auth-api';
import { clearPersistedSession } from '../infrastructure/storage/session-storage';
import { useAuthStore } from '../store/use-auth-store';

/**
 * ログアウトの一連の流れを実行する。
 *
 * backend のセッション破棄と GoogleSignin.signOut() は失敗しても続行し、
 * ローカルのセッション（secure-store とストア）は必ず破棄する。
 */
export async function performSignOut(): Promise<void> {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    try {
      await logoutAuthSession(accessToken);
    } catch {
      // トークン失効・オフラインでもローカルのログアウトは完了させる。
    }
  }

  try {
    await GoogleSignin.signOut();
  } catch {
    // 未 configure などで失敗してもローカルのログアウトは完了させる。
  }

  await clearPersistedSession();
  useAuthStore.getState().logout();
}

/** ログアウトを実行する mutation。 */
export function useSignOut() {
  return useMutation({ mutationFn: performSignOut });
}
