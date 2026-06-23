import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSpots } from '../../application';

import type { Spot } from '../../domain';

import { Spacing } from '@/shared/config';
import { formatDistanceKm, getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

const CATEGORY_COLOR = '#C67B4A';
const RATING_STAR_COLOR = '#F5A623';

type SpotWithDistance = Spot & {
  distanceKm: number | null;
};

function SpotListItem({ spot }: { spot: SpotWithDistance }) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: spot.media.imageUrl }} style={styles.image} contentFit="cover" />
        {spot.distanceKm !== null ? (
          <View style={styles.distanceBadge}>
            <ThemedText style={styles.distanceText}>{formatDistanceKm(spot.distanceKm)}</ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <ThemedText style={styles.category}>{spot.category.label}</ThemedText>
          <View style={styles.ratingRow}>
            <SymbolView
              tintColor={RATING_STAR_COLOR}
              name={{ ios: 'star.fill', android: 'star', web: 'star' }}
              size={14}
            />
            <ThemedText type="smallBold">{spot.rating.value.toFixed(1)}</ThemedText>
          </View>
        </View>

        <ThemedText type="smallBold" style={styles.name}>
          {spot.name}
        </ThemedText>

        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={3}
          style={styles.description}
        >
          {spot.description}
        </ThemedText>

        <View style={styles.hoursRow}>
          <SymbolView
            tintColor={theme.textSecondary}
            name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
            size={14}
          />
          <ThemedText type="small" themeColor="textSecondary">
            {spot.businessHours}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

function ListHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
      <ThemedText type="subtitle" style={styles.title}>
        観光スポット
      </ThemedText>
      <ThemedText type="smallBold" themeColor="textSecondary">
        近くのスポット
      </ThemedText>
    </View>
  );
}

/**
 * 観光スポット一覧を表示するコンポーネント。
 *
 * application 層の `useSpots()` 経由でデータを取得し、各スポットの
 * 画像・距離・評価・営業時間を含むカード一覧を表示する。
 */
export function SpotList() {
  const { data: spots, isPending, isError } = useSpots();
  const { coords } = useCurrentLocation();

  const spotsWithDistance = useMemo((): SpotWithDistance[] | undefined => {
    if (!spots) return undefined;

    const withDistance = spots.map((spot) => ({
      ...spot,
      distanceKm: coords
        ? getDistanceKm(
            { latitude: coords.latitude, longitude: coords.longitude },
            spot.coordinates,
          )
        : null,
    }));

    if (!coords) return withDistance;

    return [...withDistance].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [coords, spots]);

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
      data={spotsWithDistance}
      keyExtractor={(spot) => spot.id}
      renderItem={({ item }) => <SpotListItem spot={item} />}
      ListHeaderComponent={ListHeader}
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
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  card: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  imageWrapper: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  distanceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    color: CATEGORY_COLOR,
    fontSize: 13,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    lineHeight: 20,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
