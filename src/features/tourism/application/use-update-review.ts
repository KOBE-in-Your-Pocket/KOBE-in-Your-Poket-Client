import { useCallback } from 'react';

import { useReviewStore, type ReviewEdit } from '../store/use-review-store';

export function useUpdateReview(spotId: string) {
  const updateReview = useReviewStore((state) => state.updateReview);

  return useCallback(
    (reviewId: string, changes: ReviewEdit) => updateReview(spotId, reviewId, changes),
    [spotId, updateReview],
  );
}
