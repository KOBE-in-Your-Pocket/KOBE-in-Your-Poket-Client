import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchReviews } from '../infrastructure/api/mock-reviews';
import { useReviewStore } from '../store/use-review-store';

import type { Review } from '../domain/review';

export const SPOT_REVIEWS_QUERY_KEY = ['tourism', 'spot-reviews'] as const;

const EMPTY_REVIEWS: Review[] = [];

export function mergeReviews(seed: Review[], submitted: Review[]): Review[] {
  return [...seed, ...submitted].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export function useSpotReviews(spotId: string | null | undefined) {
  const seedQuery = useQuery<Review[]>({
    queryKey: [...SPOT_REVIEWS_QUERY_KEY, spotId],
    enabled: Boolean(spotId),
    queryFn: () => fetchReviews(spotId as string),
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
