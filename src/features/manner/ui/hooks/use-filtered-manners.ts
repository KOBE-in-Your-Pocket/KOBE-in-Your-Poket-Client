import { useMemo } from 'react';

import { filterMannersByKind } from '../../application/use-cases/filter-manners';
import { useKindFilterStore } from '../../store/use-kind-filter-store';

import { useManners } from './use-manners';

/**
 * 選択中の種別（selectedKind）で絞り込んだマナー項目一覧を返す UI hook。
 *
 * {@link useManners} の取得結果に {@link filterMannersByKind} を適用する。
 * selectedKind が 'all' のときは全件を返す。ローディング・エラー等の状態は useManners のものをそのまま引き継ぐ。
 */
export function useFilteredManners() {
  const query = useManners();
  const selectedKind = useKindFilterStore((state) => state.selectedKind);

  const data = useMemo(
    () => (query.data === undefined ? undefined : filterMannersByKind(query.data, selectedKind)),
    [query.data, selectedKind],
  );

  return { ...query, data };
}
