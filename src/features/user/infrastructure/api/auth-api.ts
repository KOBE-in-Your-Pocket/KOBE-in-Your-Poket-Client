import { getApiBaseUrl } from '@/shared/config';

import type { AuthSession } from '../../domain/auth-session';

/** backend 全 API 共通のエラーレスポンス形式（400 系）。 */
type ApiErrorBody = {
  status?: number;
  error?: string;
  message?: string;
  violations?: unknown[];
};

/** backend がエラーレスポンス（4xx/5xx）を返したことを表すエラー。 */
export class AuthApiError extends Error {
  /** HTTP ステータスコード。 */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

/** /auth/google と /auth/refresh が返すセッションレスポンス。 */
type SessionResponseBody = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    name: string;
    /** 初回ログイン直後などアイコン未設定時は null。 */
    iconUrl: string | null;
  };
};

export type AuthApiOptions = {
  /** 省略時は EXPO_PUBLIC_API_BASE_URL（{@link getApiBaseUrl}）を使う。 */
  baseUrl?: string;
  signal?: AbortSignal;
};

function resolveBaseUrl(baseUrl: string | undefined): string {
  const resolved = baseUrl ?? getApiBaseUrl();
  if (!resolved) {
    throw new Error(
      'backend の API ベース URL が未設定です。EXPO_PUBLIC_API_BASE_URL を .env に設定してください（.env.example 参照）。',
    );
  }

  return resolved;
}

async function postJson(
  url: string,
  { body, accessToken, signal }: { body?: unknown; accessToken?: string; signal?: AbortSignal },
): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal,
  });

  if (!response.ok) {
    let message = `認証 API がエラーを返しました (HTTP ${response.status})`;
    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // エラーレスポンスが JSON でない場合は既定メッセージのまま。
    }
    throw new AuthApiError(response.status, message);
  }

  return response;
}

/** iconUrl が null の場合は空文字に寄せる（PublicUser の iconUrl は string のため）。 */
function toAuthSession(body: SessionResponseBody): AuthSession {
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresIn: body.expiresIn,
    tokenType: body.tokenType,
    user: {
      id: body.user.id,
      name: body.user.name,
      iconUrl: body.user.iconUrl ?? '',
    },
  };
}

/**
 * Google 発行の ID トークンで backend にサインインする。
 * 初回は backend 側でユーザーが自動作成されるため signup / login の区別はない。
 */
export async function signInWithGoogle(
  idToken: string,
  options: AuthApiOptions = {},
): Promise<AuthSession> {
  const response = await postJson(`${resolveBaseUrl(options.baseUrl)}/api/v1/auth/google`, {
    body: { idToken },
    signal: options.signal,
  });

  return toAuthSession((await response.json()) as SessionResponseBody);
}

/**
 * リフレッシュトークンでセッションを再発行する。
 * リフレッシュトークンはローテーションされるため、返却されたセッションを保存し直すこと。
 */
export async function refreshAuthSession(
  refreshToken: string,
  options: AuthApiOptions = {},
): Promise<AuthSession> {
  const response = await postJson(`${resolveBaseUrl(options.baseUrl)}/api/v1/auth/refresh`, {
    body: { refreshToken },
    signal: options.signal,
  });

  return toAuthSession((await response.json()) as SessionResponseBody);
}

/** backend 側のセッションを破棄する（204 を返す）。 */
export async function logoutAuthSession(
  accessToken: string,
  options: AuthApiOptions = {},
): Promise<void> {
  await postJson(`${resolveBaseUrl(options.baseUrl)}/api/v1/auth/logout`, {
    accessToken,
    signal: options.signal,
  });
}
