import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchSpots } from '../infrastructure/api/mock-spots';

import { SPOTS_QUERY_KEY } from './use-spots';

import type { Spot } from '../domain/spot';

/**
 * 指定スポットの詳細を取得する application 層フック。
 *
 * 単一スポット取得用の API はまだ無いため、一覧取得（{@link fetchSpots}）の結果を
 * `useSpots` と同じクエリキーで共有しつつ `select` で 1 件に絞り込む。
 * これにより一覧を表示済みなら追加のネットワーク取得なしに詳細を引ける。
 * 単一取得 API が用意された際は queryFn だけ差し替えればよい。
 *
 * `spotId` が未指定のときは取得しない。一致するスポットが無ければ `data` は `undefined`。
 */
export function useSpotDetail(spotId: string | null | undefined) {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  return useQuery<Spot[], Error, Spot | undefined>({
    queryKey: [...SPOTS_QUERY_KEY, language],
    enabled: Boolean(spotId),
    queryFn: () => fetchSpots(language),
    select: (spots) => spots.find((spot) => spot.id === spotId),
  });
}
