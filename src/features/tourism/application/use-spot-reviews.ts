import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchReviews } from '../infrastructure/api/mock-reviews';
import { useReviewStore } from '../store/use-review-store';

import type { Review } from '../domain/review';

export const SPOT_REVIEWS_QUERY_KEY = ['tourism', 'spot-reviews'] as const;

const EMPTY_REVIEWS: Review[] = [];

export function mergeReviews(seed: Review[], submitted: Review[]): Review[] {
  return [...seed, ...submitted].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

/** seed（mock fetch）とユーザー投稿（store）を結合した、指定スポットのレビュー一覧。 */
export function useSpotReviews(spotId: string | null | undefined) {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  const seedQuery = useQuery<Review[]>({
    queryKey: [...SPOT_REVIEWS_QUERY_KEY, spotId, language],
    enabled: Boolean(spotId),
    queryFn: () => fetchReviews(spotId as string, language),
  });

  const submitted = useReviewStore((state) =>
    spotId ? (state.submittedReviews[spotId] ?? EMPTY_REVIEWS) : EMPTY_REVIEWS,
  );

  const data = useMemo(
    () => mergeReviews(seedQuery.data ?? EMPTY_REVIEWS, submitted),
    [seedQuery.data, submitted],
  );

  return { data, isPending: seedQuery.isPending, isError: seedQuery.isError };
}
