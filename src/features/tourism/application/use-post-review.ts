import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postReview } from '../infrastructure/api/mock-reviews';
import type { CreateReviewInput } from '../domain/review';
import { REVIEWS_QUERY_KEY } from './use-reviews';
import { SPOT_REVIEWS_QUERY_KEY } from './use-spot-reviews';
import { SPOTS_QUERY_KEY } from './use-spots';

/**
 * レビューを投稿する application 層フック。
 *
 * 投稿成功後、レビュー一覧・スポット一覧キャッシュを無効化する。
 * スポット一覧を無効化するのは、バックエンドが rating を再集計して返すため。
 */
export function usePostReview(spotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => postReview(spotId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REVIEWS_QUERY_KEY, spotId] });
      queryClient.invalidateQueries({ queryKey: [...SPOT_REVIEWS_QUERY_KEY, spotId] });
      queryClient.invalidateQueries({ queryKey: SPOTS_QUERY_KEY });
    },
  });
}
