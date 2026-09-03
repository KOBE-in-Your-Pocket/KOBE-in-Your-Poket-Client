import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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
 * seed と submitted に同一 id が現れた場合（API が投稿済みレビューを返した等）は重複させず、
 * ローカルの編集内容を優先する（submitted で上書き）。
 * postedAt は ISO 8601 のオフセット表記（`Z` / `±hh:mm`）が混在しうるため、文字列比較ではなく
 * 数値化した時刻で比較して実際の新しい順を保つ。
 * 不正な日時（空文字・非 ISO 等で `Date.parse` が NaN）は最古扱いにして末尾へ回し、
 * 比較関数が NaN を返さない全順序を保つ（sort が不定にならないようにする）。
 */
export function mergeReviews(seed: Review[], submitted: Review[]): Review[] {
  const byId = new Map<string, Review>();
  for (const review of seed) {
    byId.set(review.id, review);
  }
  for (const review of submitted) {
    byId.set(review.id, review);
  }
  return [...byId.values()].sort(compareByPostedAtDesc);
}

/** postedAt を数値化する。不正な日時は最古（-Infinity）扱いにする。 */
function toPostedAtTime(postedAt: string): number {
  const time = Date.parse(postedAt);
  return Number.isNaN(time) ? -Infinity : time;
}

/**
 * postedAt の新しい順（降順）で比較する。両方が不正な日時（-Infinity）でも NaN を返さず
 * 0（同順）を返すため、安定ソートにより元の相対順序が保たれる。
 */
function compareByPostedAtDesc(a: Review, b: Review): number {
  const timeA = toPostedAtTime(a.postedAt);
  const timeB = toPostedAtTime(b.postedAt);
  if (timeA === timeB) {
    return 0;
  }
  return timeB > timeA ? 1 : -1;
}

export function useSpotReviews(spotId: string | null | undefined) {
  const seedQuery = useQuery<Review[]>({
    queryKey: [...SPOT_REVIEWS_QUERY_KEY, spotId],
    enabled: Boolean(spotId),
    queryFn: ({ signal }) => fetchReviews(spotId as string, signal),
  });

  const submitted = useReviewStore((state) =>
    spotId ? (state.submittedReviews[spotId] ?? EMPTY_REVIEWS) : EMPTY_REVIEWS,
  );

  const data = useMemo(
    () => mergeReviews(seedQuery.data ?? EMPTY_REVIEWS, submitted),
    [seedQuery.data, submitted],
  );

  return {
    data,
    isPending: seedQuery.isPending,
    isError: seedQuery.isError,
    refetch: seedQuery.refetch,
  };
}
