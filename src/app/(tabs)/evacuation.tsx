import { useEffect } from 'react';

import { ListScreen, useListModeStore } from '@/widgets/list';

/**
 * ホーム画面の避難所ショートカット専用の隠しルート（タブバーには表示されない）。
 * 観光タブと同じ ListScreen を避難モード固定で開く。
 */
export default function EvacuationTabRoute() {
  useEffect(() => {
    useListModeStore.getState().setListMode('evacuation');
  }, []);

  return <ListScreen />;
}
