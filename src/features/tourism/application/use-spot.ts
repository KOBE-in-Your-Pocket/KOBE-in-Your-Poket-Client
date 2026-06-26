import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchSpotById } from '../infrastructure/api/mock-spots';

import { SPOTS_QUERY_KEY } from './use-spots';

import type { Spot } from '../domain/spot';

/**
 * 単一の観光スポットを取得する application 層フック。
 *
 * infrastructure の `fetchSpotById()` を useQuery でラップし、ui 層へは
 * ローディング・エラー・未検出（data が null）を含む状態だけを公開する。
 */
export function useSpot(spotId: string) {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  return useQuery<Spot | null>({
    queryKey: [...SPOTS_QUERY_KEY, 'detail', spotId, language],
    queryFn: () => fetchSpotById(spotId, language),
  });
}
