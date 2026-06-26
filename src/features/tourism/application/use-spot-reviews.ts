import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchReviews } from '../infrastructure/api/mock-reviews';

import type { Review } from '../domain/review';

/** スポットレビュー系クエリのキー名前空間。 */
export const SPOT_REVIEWS_QUERY_KEY = ['tourism', 'spot-reviews'] as const;

/**
 * 指定スポットのレビュー一覧を取得する application 層フック。
 *
 * infrastructure の `fetchReviews()` を useQuery でラップし、ui 層には
 * キャッシュ・ローディング・エラー状態を含む宣言的なインターフェースだけを公開する。
 * 実 API への差し替え時も `fetchReviews` のシグネチャが保たれる限りこのフックは変更不要。
 *
 * `spotId` が未指定（詳細未選択など）のときは取得しない。
 */
export function useSpotReviews(spotId: string | null | undefined) {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  return useQuery<Review[]>({
    queryKey: [...SPOT_REVIEWS_QUERY_KEY, spotId, language],
    enabled: Boolean(spotId),
    // enabled で存在は保証済み。
    queryFn: () => fetchReviews(spotId as string, language),
  });
}
