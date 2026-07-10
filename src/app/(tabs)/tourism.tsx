import { useNavigation } from 'expo-router';
import { useEffect, useRef } from 'react';

import { ListScreen, useListModeStore } from '@/widgets/list';

/**
 * 観光タブ・ホーム画面の観光スポットショートカット共通のルート。
 * タブナビゲーターは画面をアンマウントせず保持するため、マウント時ではなく
 * このタブに実際に切り替わったタイミングで listMode を設定する。
 *
 * タブナビゲーター（親）の `state` イベントは、祖先の Stack が別画面を
 * push/pop しただけでも（アクティブなタブ自体は変わっていなくても）発火する。
 * そのため「アクティブなタブ名が tourism である」ことだけでなく、直前の
 * アクティブタブ名から tourism への「遷移」があった場合のみ listMode を
 * 上書きする。これを怠ると、避難所詳細画面（祖先の Stack に push された画面）
 * から router.back() で戻ってきた際にも誤って発火し、トグルで選択していた
 * 避難所一覧が観光一覧に上書きされてしまう。
 */
export default function TourismTabRoute() {
  const navigation = useNavigation();
  const previousActiveRouteName = useRef<string | undefined>(undefined);

  useEffect(() => {
    const applyModeOnTabSwitch = () => {
      const state = navigation.getState();
      const activeRouteName = state?.routes[state.index]?.name;

      if (activeRouteName === 'tourism' && previousActiveRouteName.current !== 'tourism') {
        useListModeStore.getState().setListMode('tourism');
      }
      previousActiveRouteName.current = activeRouteName;
    };

    applyModeOnTabSwitch();

    return navigation.addListener('state', applyModeOnTabSwitch);
  }, [navigation]);

  return <ListScreen />;
}
