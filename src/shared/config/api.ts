/**
 * backend API のベース URL（EXPO_PUBLIC_API_BASE_URL）を返す。
 * 未設定・不正な URL・許可外プロトコル時は undefined。末尾のスラッシュは取り除く。
 */
export function getApiBaseUrl(): string | undefined {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!base) {
    return undefined;
  }

  try {
    const url = new URL(base);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      return undefined;
    }

    const pathname = url.pathname.replace(/\/$/, '');
    return `${url.origin}${pathname === '' ? '' : pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}
