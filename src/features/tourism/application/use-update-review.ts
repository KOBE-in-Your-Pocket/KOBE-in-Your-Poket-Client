import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateReview } from '../infrastructure/api/mock-reviews';
import type { UpdateReviewInput } from '../domain/review';
import { REVIEWS_QUERY_KEY } from './use-reviews';
import { SPOT_REVIEWS_QUERY_KEY } from './use-spot-reviews';
import { SPOTS_QUERY_KEY } from './use-spots';

type UpdateReviewVariables = {
  reviewId: string;
  input: UpdateReviewInput;
};

/**
 * 既存レビューを更新する application 層フック。
 *
 * 更新成功後、レビュー一覧・スポット一覧キャッシュを無効化する。
 */
export function useUpdateReview(spotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, input }: UpdateReviewVariables) =>
      updateReview(spotId, reviewId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REVIEWS_QUERY_KEY, spotId] });
      queryClient.invalidateQueries({ queryKey: [...SPOT_REVIEWS_QUERY_KEY, spotId] });
      queryClient.invalidateQueries({ queryKey: SPOTS_QUERY_KEY });
    },
  });
}
