import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage, type SupportedLanguage } from '@/shared/lib/i18n';

import { fetchReviews } from '../infrastructure/api/mock-reviews';
import type { Review } from '../domain/review';

export const REVIEWS_QUERY_KEY = ['tourism', 'reviews'] as const;

/**
 * 指定スポットのレビューを言語フィルタ付きで取得する application 層フック。
 *
 * - `filterLang` を指定すると書き込み言語で絞り込んだ結果を返す（`?lang=ja` 相当）。
 * - 表示言語は i18n から自動取得し、著者名・コメントのローカライズに使用する。
 * - 実 API 差し替え時は `fetchReviews` のシグネチャが保たれる限りこのフックは変更不要。
 */
export function useReviews(spotId: string, filterLang?: SupportedLanguage) {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  return useQuery<Review[]>({
    queryKey: [...REVIEWS_QUERY_KEY, spotId, language, filterLang ?? null],
    queryFn: () => fetchReviews(spotId, language, filterLang),
  });
}
