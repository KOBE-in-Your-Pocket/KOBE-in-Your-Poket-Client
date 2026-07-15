/**
 * バックエンド REST API のベース URL を環境変数から解決する。
 * 未設定の場合は undefined（モック実装のまま動作させる想定）。
 */
export function getApiBaseUrl(): string | undefined {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!base) {
    return undefined;
  }

  return base.replace(/\/$/, '');
}

let warnedMissingBaseUrl = false;

/**
 * 開発ビルドで API ベース URL 未設定（=モック動作）であることを一度だけ警告する。
 * モックで動いている部分と実APIで動いている部分を開発者が把握できるようにするための明示。
 */
export function warnIfApiBaseUrlMissing(): void {
  if (!__DEV__ || warnedMissingBaseUrl || getApiBaseUrl()) {
    return;
  }

  warnedMissingBaseUrl = true;
  console.warn(
    'EXPO_PUBLIC_API_BASE_URL が未設定のため、API はモックデータで動作します。実APIへ接続する場合は .env を設定してください（.env.example 参照）。',
  );
}
