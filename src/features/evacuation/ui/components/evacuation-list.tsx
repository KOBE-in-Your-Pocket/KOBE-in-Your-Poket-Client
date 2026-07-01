import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEvacuationShelters } from '../../application/use-evacuation-shelters';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';

import { ACCESSIBLE_COLOR, CAPACITY_TEXT_COLOR, styles } from '../styles/evacuation-list.styles';

import { Spacing } from '@/shared/config';
import { formatDistanceKm, getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { ThemedText, ThemedView } from '@/shared/ui';

type ShelterWithDistance = EvacuationShelter & {
  distanceKm: number | null;
  rank: number;
};

function ShelterListItem({ shelter }: { shelter: ShelterWithDistance }) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: shelter.media.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.rankBadge}>
          <ThemedText style={styles.rankBadgeText}>
            {t('evacuation.list.rankBadge', { rank: shelter.rank })}
          </ThemedText>
        </View>
        {shelter.distanceKm !== null ? (
          <View style={styles.distanceBadge}>
            <ThemedText style={styles.distanceText}>
              {formatDistanceKm(shelter.distanceKm)}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <ThemedText style={styles.category}>
            {t(`evacuation.list.category.${shelter.facilityCategory}`)}
          </ThemedText>
          {shelter.capacity !== undefined ? (
            <View style={styles.capacityBadge}>
              <SymbolView
                tintColor={CAPACITY_TEXT_COLOR}
                name={{ ios: 'shield.fill', android: 'shield', web: 'shield' }}
                size={14}
              />
              <ThemedText style={styles.capacityText}>
                {t('evacuation.list.capacity', { count: shelter.capacity })}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <ThemedText style={styles.name}>{shelter.name}</ThemedText>

        <ThemedText type="small" themeColor="textSecondary" style={styles.address}>
          {shelter.address}
        </ThemedText>

        <View style={styles.footerRow}>
          <SymbolView
            tintColor={ACCESSIBLE_COLOR}
            name={{
              ios: 'figure.roll',
              android: 'accessible',
              web: 'accessible',
            }}
            size={16}
          />
          <ThemedText style={styles.accessibilityText}>
            {shelter.accessible
              ? t('evacuation.list.accessible.yes')
              : t('evacuation.list.accessible.no')}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
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
export function EvacuationList() {
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

    return sorted.map((shelter, index) => ({
      ...shelter,
      rank: index + 1,
    }));
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
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
    />
  );
}
