import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEvacuationShelters } from '../../application/use-evacuation-shelters';

import type { EvacuationShelter, ShelterType } from '../../domain/evacuation-shelter';

import { styles, TYPE_CHIP_COLORS } from '../styles/evacuation-list.styles';

import { Spacing } from '@/shared/config';
import { formatDistanceKm, getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { ThemedText, ThemedView } from '@/shared/ui';

type ShelterWithDistance = EvacuationShelter & { distanceKm: number | null };

function TypeChip({ type }: { type: ShelterType }) {
  const { t } = useTranslation();
  const color = TYPE_CHIP_COLORS[type];
  return (
    <View style={[styles.typeChip, { backgroundColor: color + '22' }]}>
      <ThemedText style={[styles.typeChipText, { color }]}>
        {t(`evacuation.list.type.${type}`)}
      </ThemedText>
    </View>
  );
}

function EvacuationListItem({ shelter }: { shelter: ShelterWithDistance }) {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.card}>
      <View style={styles.cardRow}>
        <ThemedText type="smallBold" style={styles.name} numberOfLines={2}>
          {shelter.name}
        </ThemedText>
        <TypeChip type={shelter.type} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {shelter.address}
      </ThemedText>
      <View style={styles.cardRow}>
        {shelter.distanceKm !== null ? (
          <ThemedText type="small" themeColor="textSecondary">
            {formatDistanceKm(shelter.distanceKm)}
          </ThemedText>
        ) : (
          <View />
        )}
        {shelter.capacity !== undefined ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('evacuation.list.capacity', { count: shelter.capacity })}
          </ThemedText>
        ) : null}
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
    </View>
  );
}

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

    if (!coords) return withDistance;

    return [...withDistance].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
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

  return (
    <FlatList
      data={sheltersWithDistance}
      keyExtractor={(shelter) => shelter.id}
      renderItem={({ item }) => <EvacuationListItem shelter={item} />}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <ThemedText themeColor="textSecondary">{t('evacuation.list.empty')}</ThemedText>
      }
      contentContainerStyle={styles.listContent}
    />
  );
}
