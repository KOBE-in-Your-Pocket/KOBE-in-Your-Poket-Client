import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { ListScreen, useListModeStore } from '@/widgets/list';

/**
 * 観光タブ・ホーム画面の観光スポットショートカット共通のルート。
 * タブナビゲーターは画面をアンマウントせず保持するため、マウント時ではなく
 * フォーカスの都度 listMode を設定する（useFocusEffect）。
 */
export default function TourismTabRoute() {
  useFocusEffect(
    useCallback(() => {
      useListModeStore.getState().setListMode('tourism');
    }, []),
  );

  return <ListScreen />;
}
