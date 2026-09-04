import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import type { ConfigureParams } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { AuthApiError } from '../domain/auth-api-error';
import type { AuthSession } from '../domain/auth-session';
import type { AuthGateway, SessionStore } from '../domain/auth-ports';
import { GoogleSignInConfigError } from '../domain/google-sign-in-config-error';
import { defaultAuthGateway, defaultSessionStore } from './auth-deps';
import { bumpSessionGeneration, commitSession, getSessionGeneration } from './session-operation';

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
      throw new GoogleSignInConfigError(
        'Google サインインの iOS クライアント ID が未設定です。EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID を .env に設定してください（.env.example 参照）。',
      );
    }
    return { iosClientId };
  }

  if (Platform.OS === 'android') {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!webClientId) {
      throw new GoogleSignInConfigError(
        'Google サインインの Web クライアント ID が未設定です。Android では idToken 取得に EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID が必要です（.env.example 参照）。',
      );
    }
    return { webClientId };
  }

  throw new GoogleSignInConfigError(`Google サインインは ${Platform.OS} では未対応です。`);
}

/** GoogleSignin.configure はプロセス内で 1 回だけ呼べばよい。 */
function ensureGoogleSignInConfigured(): void {
  if (googleSignInConfigured) {
    return;
  }

  GoogleSignin.configure(resolveGoogleSignInConfig());
  googleSignInConfigured = true;
}

type GoogleSignInDeps = {
  authGateway: AuthGateway;
  sessionStore: SessionStore;
};

/**
 * Google サインインの一連の流れを実行する。
 *
 * Google のネイティブサインイン → ID トークンを backend へ POST →
 * secure-store への永続化 → ストア更新。
 * ユーザーがサインインをキャンセルした場合は null を返す（エラーにしない）。
 */
export async function performGoogleSignIn(
  deps: GoogleSignInDeps = {
    authGateway: defaultAuthGateway,
    sessionStore: defaultSessionStore,
  },
): Promise<AuthSession | null> {
  bumpSessionGeneration();
  const generation = getSessionGeneration();

  ensureGoogleSignInConfigured();

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    return null;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    // idToken が空で返るのはクライアント ID の設定違い（Android の webClientId 未設定など）が原因。
    throw new GoogleSignInConfigError(
      'Google から ID トークンを取得できませんでした。クライアント ID の設定を確認してください。',
    );
  }

  const session = await deps.authGateway.signInWithGoogle(idToken);
  return commitSession(session, generation, deps.sessionStore);
}

/** Google サインイン失敗の種別（UI 表示用の安定した分類）。 */
export type GoogleSignInErrorKind =
  | 'configMissing'
  | 'playServicesUnavailable'
  | 'inProgress'
  | 'backendRejected'
  | 'network'
  | 'unknown';

/**
 * Google サインイン失敗のエラーを UI 表示用の種別へ変換する。
 *
 * ネイティブのエラーコードや HTTP ステータスの解釈は application 層に閉じ、
 * UI は種別 → 文言の対応のみを持つ（メール認証の resolveEmailSignInErrorKind と同じ方針）。
 */
export function resolveGoogleSignInErrorKind(error: unknown): GoogleSignInErrorKind {
  // クライアント ID 未設定・ID トークン欠落はユーザー操作では解消できない設定不備。
  if (error instanceof GoogleSignInConfigError) {
    return 'configMissing';
  }

  if (error instanceof AuthApiError) {
    return 'backendRejected';
  }

  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return 'playServicesUnavailable';
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return 'inProgress';
    }
  }

  // React Native の fetch はオフライン時に TypeError('Network request failed') を投げる。
  if (error instanceof TypeError && /network request failed/i.test(error.message)) {
    return 'network';
  }

  return 'unknown';
}

/** Google サインインを実行する mutation。キャンセル時は null で成功扱いになる。 */
export function useGoogleSignIn() {
  return useMutation({
    mutationFn: () => performGoogleSignIn(),
    onError: (error) => {
      // UI には種別ごとの定型文しか出せないため、原因の特定用に開発ビルドでは実エラーを残す。
      if (__DEV__) {
        console.warn(
          `[google-sign-in] 失敗 (${resolveGoogleSignInErrorKind(error)}):`,
          error instanceof Error ? error.message : error,
        );
      }
    },
  });
}
