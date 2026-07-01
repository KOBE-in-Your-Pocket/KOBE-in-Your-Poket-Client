import { useQuery } from '@tanstack/react-query';

import { fetchEvacuationShelters } from '../infrastructure/api/mock-shelters';

import { EVACUATION_SHELTERS_QUERY_KEY } from './use-evacuation-shelters';

import type { EvacuationShelter } from '../domain/evacuation-shelter';

/**
 * ID 指定で避難所詳細（名称・住所・収容人数・種類など）を取得する application 層フック。
 * 単一取得 API が無いため一覧（{@link fetchEvacuationShelters}）を同じキーで共有し `select` で 1 件に絞る。
 * `shelterId` 未指定時は取得せず、該当が無ければ `data` は `undefined`。
 */
export function useEvacuationShelterDetail(shelterId: string | null | undefined) {
  return useQuery<EvacuationShelter[], Error, EvacuationShelter | undefined>({
    queryKey: EVACUATION_SHELTERS_QUERY_KEY,
    enabled: Boolean(shelterId),
    queryFn: fetchEvacuationShelters,
    select: (shelters) => shelters.find((shelter) => shelter.id === shelterId),
  });
}
