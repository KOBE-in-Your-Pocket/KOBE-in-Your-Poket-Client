import { useQuery } from '@tanstack/react-query';

import { fetchEvacuationShelters } from '../infrastructure/api/mock-shelters';

import type { EvacuationShelter } from '../domain/evacuation-shelter';

/** 避難所系クエリのキー名前空間。 */
export const EVACUATION_SHELTERS_QUERY_KEY = ['evacuation', 'shelters'] as const;

/**
 * 避難所一覧を取得する application 層フック。
 *
 * infrastructure の `fetchEvacuationShelters()` を useQuery でラップし、ui 層には
 * キャッシュ・ローディング・エラー状態を含む宣言的なインターフェースだけを公開する。
 * 実 API / ローカル DB への差し替え時も `fetchEvacuationShelters` のシグネチャが
 * 保たれる限りこのフックは変更不要。
 */
export function useEvacuationShelters() {
  return useQuery<EvacuationShelter[]>({
    queryKey: EVACUATION_SHELTERS_QUERY_KEY,
    queryFn: fetchEvacuationShelters,
  });
}
