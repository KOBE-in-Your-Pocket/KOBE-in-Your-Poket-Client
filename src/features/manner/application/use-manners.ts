import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { resolveLanguage } from '@/shared/lib/i18n';

import { fetchManners } from '../infrastructure/api/mock-manners';

import type { MannerItem } from '../domain/manner-item';

/** マナー項目系クエリのキー名前空間。 */
export const MANNERS_QUERY_KEY = ['manner', 'manners'] as const;

/**
 * マナー項目一覧を取得する application 層フック。
 *
 * infrastructure の `fetchManners()` を useQuery でラップし、ui 層には
 * キャッシュ・ローディング・エラー状態を含む宣言的なインターフェースだけを公開する。
 * 実 API への差し替え時も `fetchManners` のシグネチャが保たれる限りこのフックは変更不要。
 */
export function useManners() {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);

  return useQuery<MannerItem[]>({
    queryKey: [...MANNERS_QUERY_KEY, language],
    queryFn: () => fetchManners(language),
  });
}
