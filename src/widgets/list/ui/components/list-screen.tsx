import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/shared/config';
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
  const subtitleKey =
    listMode === 'tourism' ? 'tourism.spotList.subtitle' : 'evacuation.list.subtitle';

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.three, backgroundColor: theme.background },
        ]}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <ThemedText type="subtitle">{t(titleKey)}</ThemedText>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {t(subtitleKey)}
            </ThemedText>
          </View>
          <ListModeToggle />
        </View>
        <ListGenreFilter />
      </View>
      <SwitchableList />
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    gap: Spacing.one,
  },
});
