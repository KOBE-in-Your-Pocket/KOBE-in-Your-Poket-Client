import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEvacuationShelters } from '../../application/use-evacuation-shelters';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';

import { ACCESSIBLE_COLOR, styles } from '../styles/evacuation-list.styles';

import { Spacing } from '@/shared/config';
import { formatDistanceKm, getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

type ShelterWithDistance = EvacuationShelter & {
  distanceKm: number | null;
};

function ShelterListItem({ shelter }: { shelter: ShelterWithDistance }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/evacuation/[id]', params: { id: shelter.id } })}
      accessibilityRole="button"
      accessibilityLabel={shelter.name}
    >
      <ThemedView style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: shelter.media.imageUrl }} style={styles.image} contentFit="cover" />
          {shelter.distanceKm !== null ? (
            <View style={styles.distanceBadge}>
              <ThemedText style={styles.distanceText}>
                {formatDistanceKm(shelter.distanceKm)}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.category}>
            {t(`evacuation.list.category.${shelter.facilityCategory}`)}
          </ThemedText>

          <ThemedText style={styles.name}>{shelter.name}</ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.address}>
            {shelter.address}
          </ThemedText>

          <View style={styles.infoRow}>
            {shelter.capacity !== undefined ? (
              <View style={styles.infoItem}>
                <SymbolView
                  tintColor={theme.textSecondary}
                  name={{ ios: 'person.2.fill', android: 'groups', web: 'groups' }}
                  size={14}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  {t('evacuation.list.capacity', { count: shelter.capacity })}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.infoItem}>
              <SymbolView
                tintColor={ACCESSIBLE_COLOR}
                name={{
                  ios: 'figure.roll',
                  android: 'accessible',
                  web: 'accessible',
                }}
                size={14}
              />
              <ThemedText type="small" style={styles.accessibilityText}>
                {shelter.accessible
                  ? t('evacuation.list.accessible.yes')
                  : t('evacuation.list.accessible.no')}
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

function ListHeader() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
      <ThemedText type="subtitle" style={styles.title}>
        {t('evacuation.list.title')}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('evacuation.list.subtitle')}
      </ThemedText>
    </View>
  );
}

/**
 * 避難所一覧を表示するコンポーネント。
 *
 * application 層の `useEvacuationShelters()` 経由でデータを取得し、各避難所の
 * 画像・距離・施設種別・収容人数・バリアフリー情報を含むカード一覧を表示する。
 */
export function EvacuationList({ showHeader = true }: { showHeader?: boolean } = {}) {
  const { t } = useTranslation();
  const { data: shelters, isPending, isError } = useEvacuationShelters();
  const { coords } = useCurrentLocation();

  const sheltersWithDistance = useMemo((): ShelterWithDistance[] | undefined => {
    if (!shelters) return undefined;

    const withDistance = shelters.map((shelter) => ({
      ...shelter,
      distanceKm: coords
        ? getDistanceKm(
            { latitude: coords.latitude, longitude: coords.longitude },
            shelter.coordinates,
          )
        : null,
    }));

    const sorted = coords
      ? [...withDistance].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
      : withDistance;

    return sorted;
  }, [coords, shelters]);

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
        <ThemedText themeColor="textSecondary">{t('evacuation.list.loadError')}</ThemedText>
      </ThemedView>
    );
  }

  if (!sheltersWithDistance || sheltersWithDistance.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{t('evacuation.list.empty')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={sheltersWithDistance}
      keyExtractor={(shelter) => shelter.id}
      renderItem={({ item }) => <ShelterListItem shelter={item} />}
      ListHeaderComponent={showHeader ? ListHeader : undefined}
      contentContainerStyle={styles.listContent}
    />
  );
}
