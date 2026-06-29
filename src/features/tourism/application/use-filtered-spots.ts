import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchSpots } from '../infrastructure/api/mock-spots';
import { useGenreFilterStore } from '../store/use-genre-filter-store';

import { SPOTS_QUERY_KEY } from './use-spots';

import type { Spot } from '../domain/spot';
import type { SelectedGenre } from '../store/use-genre-filter-store';

/**
 * スポット一覧を selectedGenre で絞り込む純粋関数。
 * 'all' のときは全件をそのまま返す。
 */
export function filterSpotsByGenre(spots: Spot[], genre: SelectedGenre): Spot[] {
  if (genre === 'all') return spots;
  return spots.filter((spot) => spot.genre === genre);
}

/**
 * 選択中ジャンルで絞り込んだ観光スポット一覧を返す application 層フック。
 *
 * selectedGenre が 'all' のときは全件を返す。
 */
export function useFilteredSpots() {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);
  const selectedGenre = useGenreFilterStore((state) => state.selectedGenre);

  return useQuery<Spot[], Error, Spot[]>({
    queryKey: [...SPOTS_QUERY_KEY, language, selectedGenre],
    queryFn: () => fetchSpots(language),
    select: (spots) => filterSpotsByGenre(spots, selectedGenre),
  });
}
