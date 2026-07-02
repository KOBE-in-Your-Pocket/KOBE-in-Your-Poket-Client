import { useQuery } from '@tanstack/react-query';

import { getEvacuationShelterByIdFromLocalDb } from '../use-cases/local-evacuation-shelter-queries';

import { EVACUATION_SHELTERS_QUERY_KEY } from './use-evacuation-shelters';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';

/**
 * ID 指定で避難所詳細（名称・住所・収容人数・種類など）を取得する application 層フック。
 * ローカル SQLite リポジトリの `findById` 経由で取得する。
 * `shelterId` 未指定時は取得せず、該当が無ければ `data` は `undefined`。
 */
export function useEvacuationShelterDetail(shelterId: string | null | undefined) {
  return useQuery<EvacuationShelter | null, Error, EvacuationShelter | undefined>({
    queryKey: [...EVACUATION_SHELTERS_QUERY_KEY, shelterId],
    enabled: Boolean(shelterId),
    queryFn: () => getEvacuationShelterByIdFromLocalDb(shelterId!),
    select: (shelter) => shelter ?? undefined,
  });
}
