import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchSpots } from '../infrastructure/api/mock-spots';
import { useGenreFilterStore } from '../store/use-genre-filter-store';

import { SPOTS_QUERY_KEY } from './use-spots';

import type { Spot } from '../domain/spot';

/**
 * 選択中ジャンルで絞り込んだ観光スポット一覧を返す application 層フック。
 *
 * `useSpots` と同じクエリキーを共有するため追加のネットワーク取得は発生しない。
 * selectedGenre が 'all' のときは全件を返す。
 */
export function useFilteredSpots() {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);
  const selectedGenre = useGenreFilterStore((state) => state.selectedGenre);

  return useQuery<Spot[], Error, Spot[]>({
    queryKey: [...SPOTS_QUERY_KEY, language],
    queryFn: () => fetchSpots(language),
    select: (spots) =>
      selectedGenre === 'all' ? spots : spots.filter((spot) => spot.genre === selectedGenre),
  });
}
