import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchReviews } from '../infrastructure/api/review-api';
import { useReviewStore } from '../store/use-review-store';

import type { Review } from '../domain/review';

export const SPOT_REVIEWS_QUERY_KEY = ['tourism', 'spot-reviews'] as const;

const EMPTY_REVIEWS: Review[] = [];

/**
 * サーバー取得分（seed）とローカル投稿分（submitted）を結合し、投稿日時の新しい順に並べる。
 *
 * 投稿・編集は当面ローカルストアに保持されるため、実 API 取得分にユーザー自身の
 * 投稿を重ねることで、投稿直後でも一覧から消えないようにする。
 * seed と submitted は ID が重複しない前提（サーバー ID とローカル生成 ID）で単純結合する。
 * postedAt は ISO 8601 のオフセット表記（`Z` / `±hh:mm`）が混在しうるため、文字列比較ではなく
 * 数値化した時刻で比較して実際の新しい順を保つ。
 */
export function mergeReviews(seed: Review[], submitted: Review[]): Review[] {
  return [...seed, ...submitted].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
}

export function useSpotReviews(spotId: string | null | undefined) {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  const seedQuery = useQuery<Review[]>({
    queryKey: [...SPOT_REVIEWS_QUERY_KEY, spotId, language],
    enabled: Boolean(spotId),
    queryFn: ({ signal }) => fetchReviews(spotId as string, language, signal),
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
