import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

import { useListModeStore } from '../../store/use-list-mode-store';
import { ListGenreFilter } from './list-genre-filter';
import { ListModeToggle } from './list-mode-toggle';
import { SwitchableList } from './switchable-list';

export function ListScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const listMode = useListModeStore((state) => state.listMode);

  const titleKey = listMode === 'tourism' ? 'tourism.spotList.title' : 'evacuation.list.title';

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.three, backgroundColor: theme.background },
        ]}
      >
        <ThemedText type="title" style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          {t(titleKey)}
        </ThemedText>
        <ListGenreFilter />
      </View>
      <SwitchableList />
      {/* モードトグルは右下に固定表示（スクロールに追従しないようリストの外＝container 直下に置く）。 */}
      <ListModeToggle />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  // ホーム画面タイトルに合わせる（筆記体・中央揃え・fontSize 30 / lineHeight 40）。
  title: {
    fontFamily: Fonts.cursive,
    fontWeight: 'normal',
    fontSize: 30,
    lineHeight: 40,
    textAlign: 'center',
  },
});
