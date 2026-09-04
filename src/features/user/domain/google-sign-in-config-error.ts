/**
 * Google サインインに必要なクライアント ID が未設定であることを表すエラー。
 *
 * 環境変数の欠落はユーザー操作では解消できない設定不備なので、
 * backend 由来の失敗（{@link AuthApiError}）や通信エラーとは区別して扱う。
 */
export class GoogleSignInConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleSignInConfigError';
  }
}
