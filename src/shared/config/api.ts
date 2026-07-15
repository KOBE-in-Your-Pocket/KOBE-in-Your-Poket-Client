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
