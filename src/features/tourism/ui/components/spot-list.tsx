import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { useSpots } from '../../application';

import type { Spot, SpotGenre } from '../../domain';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

/** ジャンル区分の表示名。domain の `SpotGenre` を UI 向けの日本語ラベルに対応づける。 */
const GENRE_LABELS: Record<SpotGenre, string> = {
  landmark: 'ランドマーク',
  nature: '自然',
  history: '歴史',
  gourmet: 'グルメ',
  onsen: '温泉',
};

function SpotListItem({ spot }: { spot: Spot }) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.item}>
      <View style={styles.itemHeader}>
        <ThemedText type="subtitle" style={styles.name}>
          {spot.name}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.genre}>
          {GENRE_LABELS[spot.genre]}
        </ThemedText>
      </View>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {spot.description}
      </ThemedText>
    </ThemedView>
  );
}

/**
 * 観光スポット一覧を表示するコンポーネント。
 *
 * application 層の `useSpots()` 経由でデータを取得し、各スポットの
 * 名前・ジャンル・説明を一覧表示する。読み込み中とエラー時の状態も扱う。
 */
export function SpotList() {
  const { data: spots, isPending, isError } = useSpots();

  if (isPending) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">スポットを読み込めませんでした。</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={spots}
      keyExtractor={(spot) => spot.id}
      renderItem={({ item }) => <SpotListItem spot={item} />}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  item: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
  },
  genre: {
    flexShrink: 0,
  },
});
