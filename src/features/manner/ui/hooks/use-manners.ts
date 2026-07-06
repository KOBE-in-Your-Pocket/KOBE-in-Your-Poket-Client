import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { getManners } from '../../application/use-cases/get-manners';
import { createMockMannerRepository } from '../../infrastructure/api/mock-manner-repository';

import type { MannerItem } from '../../domain/manner-item';

/** マナー項目系クエリのキー名前空間。 */
export const MANNERS_QUERY_KEY = ['manner', 'manners'] as const;

const mannerRepository = createMockMannerRepository();

/**
 * マナー項目一覧を取得する UI hook。
 *
 * {@link getManners} ユースケースを useQuery でラップし、
 * Repository 実装の選択は composition 層（本 hook）で行う。
 */
export function useManners() {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  return useQuery<MannerItem[]>({
    queryKey: [...MANNERS_QUERY_KEY, language],
    queryFn: () => getManners(language, mannerRepository),
  });
}
