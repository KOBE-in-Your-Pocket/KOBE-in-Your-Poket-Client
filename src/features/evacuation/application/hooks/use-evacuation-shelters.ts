import { useQuery } from '@tanstack/react-query';

import { getEvacuationSheltersFromLocalDb } from '../use-cases/local-evacuation-shelter-queries';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';

/** 避難所系クエリのキー名前空間。 */
export const EVACUATION_SHELTERS_QUERY_KEY = ['evacuation', 'shelters'] as const;

/**
 * 避難所一覧を取得する application 層フック。
 *
 * ローカル SQLite リポジトリ経由で取得する。bootstrap 完了後に DB を読むため、
 * 初回起動時のシード後データもオフラインで閲覧できる。
 */
export function useEvacuationShelters() {
  return useQuery<EvacuationShelter[]>({
    queryKey: EVACUATION_SHELTERS_QUERY_KEY,
    queryFn: getEvacuationSheltersFromLocalDb,
  });
}
