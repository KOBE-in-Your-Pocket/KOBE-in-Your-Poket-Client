import { apiFetch } from '@/shared/lib/api';

import type { Review } from '../../domain/review';

/**
 * 指定スポットに投稿されたレビュー一覧を取得する。
 *
 * バックエンド `GET /api/v1/tourism/spots/:spotId/reviews` を呼び出す。レビューは言語横断で
 * 全件取得し、言語での絞り込みは UI 側の ReviewLanguageFilter に委ねるため `lang` クエリは付けない。
 * レスポンス形式はクライアント {@link Review} 型と直接互換。該当スポットにレビューが無ければ空配列が返る。
 *
 * `signal` は React Query の queryFn から渡されるキャンセル用シグナル。クエリが abort された際に
 * 実 fetch も中断できるよう `apiFetch` まで伝播する。
 */
export async function fetchReviews(spotId: string, signal?: AbortSignal): Promise<Review[]> {
  return apiFetch<Review[]>(`/api/v1/tourism/spots/${encodeURIComponent(spotId)}/reviews`, {
    signal,
  });
}
