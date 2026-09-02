import { apiFetch } from '@/shared/lib/api';
import type { SupportedLanguage } from '@/shared/lib/i18n';

import type { Review } from '../../domain/review';

/**
 * 指定スポットに投稿されたレビュー一覧を取得する。
 *
 * バックエンド `GET /api/v1/tourism/spots/:spotId/reviews` を呼び出し、指定言語で
 * 解決済みのレビュー一覧を返す。レスポンス形式はクライアント {@link Review} 型と直接互換。
 * 該当スポットにレビューが無ければ空配列が返る。
 *
 * `signal` は React Query の queryFn から渡されるキャンセル用シグナル。クエリが abort された際に
 * 実 fetch も中断できるよう `apiFetch` まで伝播する。
 */
export async function fetchReviews(
  spotId: string,
  language: SupportedLanguage,
  signal?: AbortSignal,
): Promise<Review[]> {
  return apiFetch<Review[]>(`/api/v1/tourism/spots/${encodeURIComponent(spotId)}/reviews`, {
    query: { lang: language },
    signal,
  });
}
