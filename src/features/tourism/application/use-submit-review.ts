import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useCurrentUser } from '@/features/user/application/use-current-user';
import { resolveLanguage } from '@/shared/lib/i18n';

import { useReviewStore, type ReviewEdit } from '../store/use-review-store';

import type { Review } from '../domain/review';

function generateReviewId(): string {
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useSubmitReview(spotId: string) {
  const { i18n } = useTranslation();
  const author = useCurrentUser();
  const addReview = useReviewStore((state) => state.addReview);

  return useCallback(
    (input: ReviewEdit) => {
      const review: Review = {
        id: generateReviewId(),
        rating: input.rating,
        comment: input.comment,
        author,
        postedAt: new Date().toISOString(),
        language: resolveLanguage(i18n.language),
      };
      addReview(spotId, review);
    },
    [spotId, author, addReview, i18n.language],
  );
}
