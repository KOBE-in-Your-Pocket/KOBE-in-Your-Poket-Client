/**
 * backend API のベース URL（EXPO_PUBLIC_API_BASE_URL）を返す。
 * 未設定時は undefined。末尾のスラッシュは取り除く。
 */
export function getApiBaseUrl(): string | undefined {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!base) {
    return undefined;
  }

  return base.replace(/\/$/, '');
}
