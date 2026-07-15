import type { PublicUser } from './public-user';

/**
 * backend 認証 API（/auth/google, /auth/refresh）が発行するセッション。
 * accessToken は各 API の Authorization: Bearer ヘッダーに使う。
 */
export type AuthSession = {
  /** backend API へのアクセストークン（短命）。 */
  accessToken: string;
  /** アクセストークン再発行用のリフレッシュトークン。 */
  refreshToken: string;
  /** accessToken の有効期間（秒）。 */
  expiresIn: number;
  /** トークン種別（"bearer"）。 */
  tokenType: string;
  /** ログインしたユーザー。 */
  user: PublicUser;
};
