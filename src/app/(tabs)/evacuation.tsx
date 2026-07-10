import { useNavigation } from 'expo-router';
import { useEffect, useRef } from 'react';

import { ListScreen, useListModeStore } from '@/widgets/list';

/**
 * ホーム画面の避難所ショートカット専用の隠しルート（タブバーには表示されない）。
 * 観光タブと同じ ListScreen を避難モード固定で開く。
 * タブナビゲーターは画面をアンマウントせず保持するため、マウント時ではなく
 * このタブに実際に切り替わったタイミングで listMode を設定する。
 *
 * タブナビゲーター（親）の `state` イベントは、祖先の Stack が別画面を
 * push/pop しただけでも（アクティブなタブ自体は変わっていなくても）発火する。
 * そのため「アクティブなタブ名が evacuation である」ことだけでなく、直前の
 * アクティブタブ名から evacuation への「遷移」があった場合のみ listMode を
 * 上書きする（詳細は tourism.tsx のコメント参照）。
 */
export default function EvacuationTabRoute() {
  const navigation = useNavigation();
  const previousActiveRouteName = useRef<string | undefined>(undefined);

  useEffect(() => {
    const applyModeOnTabSwitch = () => {
      const state = navigation.getState();
      const activeRouteName = state?.routes[state.index]?.name;

      if (activeRouteName === 'evacuation' && previousActiveRouteName.current !== 'evacuation') {
        useListModeStore.getState().setListMode('evacuation');
      }
      previousActiveRouteName.current = activeRouteName;
    };

    applyModeOnTabSwitch();

    return navigation.addListener('state', applyModeOnTabSwitch);
  }, [navigation]);

  return <ListScreen />;
}
