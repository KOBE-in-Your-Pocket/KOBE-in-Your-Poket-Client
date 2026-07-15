import { useMemo } from 'react';

import { useSpots } from './use-spots';

/**
 * 指定スポットの詳細を取得する application 層フック。
 *
 * {@link useSpots} と同じキャッシュを共有し、一覧取得済みなら追加取得なしに
 * 詳細を引ける。`spotId` が未指定のときは `data` は `undefined`。
 */
export function useSpotDetail(spotId: string | null | undefined) {
  const spotsQuery = useSpots();

  const data = useMemo(() => {
    if (!spotId || !spotsQuery.data) return undefined;
    return spotsQuery.data.find((spot) => spot.id === spotId);
  }, [spotId, spotsQuery.data]);

  return {
    ...spotsQuery,
    data,
  };
}
