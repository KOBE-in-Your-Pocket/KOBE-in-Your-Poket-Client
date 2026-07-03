import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { ListScreen, useListModeStore } from '@/widgets/list';

/**
 * ホーム画面の避難所ショートカット専用の隠しルート（タブバーには表示されない）。
 * 観光タブと同じ ListScreen を避難モード固定で開く。
 * タブナビゲーターは画面をアンマウントせず保持するため、マウント時ではなく
 * フォーカスの都度 listMode を設定する（useFocusEffect）。
 */
export default function EvacuationTabRoute() {
  useFocusEffect(
    useCallback(() => {
      useListModeStore.getState().setListMode('evacuation');
    }, []),
  );

  return <ListScreen />;
}
