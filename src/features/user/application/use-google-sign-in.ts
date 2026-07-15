import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import type { ConfigureParams } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';

import type { AuthSession } from '../domain/auth-session';
import { signInWithGoogle } from '../infrastructure/api/auth-api';
import { savePersistedSession } from '../infrastructure/storage/session-storage';
import { useAuthStore } from '../store/use-auth-store';

let googleSignInConfigured = false;

/**
 * OS ごとに GoogleSignin.configure へ渡す Client ID を解決する。
 * - iOS: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID（種別 iOS）
 * - Android: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID（種別ウェブ。idToken 取得に必須）
 */
export function resolveGoogleSignInConfig(): ConfigureParams {
  if (Platform.OS === 'ios') {
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
    if (!iosClientId) {
      throw new Error(
        'Google サインインの iOS クライアント ID が未設定です。EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID を .env に設定してください（.env.example 参照）。',
      );
    }
    return { iosClientId };
  }

  if (Platform.OS === 'android') {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!webClientId) {
      throw new Error(
        'Google サインインの Web クライアント ID が未設定です。Android では idToken 取得に EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID が必要です（.env.example 参照）。',
      );
    }
    return { webClientId };
  }

  throw new Error(`Google サインインは ${Platform.OS} では未対応です。`);
}

/** GoogleSignin.configure はプロセス内で 1 回だけ呼べばよい。 */
function ensureGoogleSignInConfigured(): void {
  if (googleSignInConfigured) {
    return;
  }

  GoogleSignin.configure(resolveGoogleSignInConfig());
  googleSignInConfigured = true;
}

/**
 * Google サインインの一連の流れを実行する。
 *
 * Google のネイティブサインイン → ID トークンを backend へ POST →
 * ストア更新 + secure-store への永続化。
 * ユーザーがサインインをキャンセルした場合は null を返す（エラーにしない）。
 */
export async function performGoogleSignIn(): Promise<AuthSession | null> {
  ensureGoogleSignInConfigured();

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    return null;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error('Google から ID トークンを取得できませんでした。');
  }

  const session = await signInWithGoogle(idToken);
  useAuthStore.getState().setSession(session);
  await savePersistedSession(session);
  return session;
}

/** Google サインインを実行する mutation。キャンセル時は null で成功扱いになる。 */
export function useGoogleSignIn() {
  return useMutation({
    mutationFn: performGoogleSignIn,
    onError: (error) => {
      console.error('[GoogleSignIn]', error);
    },
  });
}
