import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { useSpotDetail } from '../../application/use-spot-detail';

import { RATING_STAR_COLOR, styles } from '../../ui/styles/spot-detail.styles';

import type { Spot } from '../../domain/spot';

import { ReviewList } from './review-list';

import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

function formatCoordinates(spot: Spot): string {
  const { latitude, longitude } = spot.coordinates;
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function SpotDetailContent({ spot }: { spot: Spot }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Image source={{ uri: spot.media.imageUrl }} style={styles.image} contentFit="cover" />

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.metaRow}>
            <ThemedText style={styles.category}>{spot.category.label}</ThemedText>
            {spot.rating ? (
              <View style={styles.ratingRow}>
                <SymbolView
                  tintColor={RATING_STAR_COLOR}
                  name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                  size={14}
                />
                <ThemedText type="smallBold">{spot.rating.value.toFixed(1)}</ThemedText>
              </View>
            ) : null}
          </View>

          <ThemedText type="subtitle" style={styles.name}>
            {spot.name}
          </ThemedText>
        </View>

        <ThemedText themeColor="textSecondary" style={styles.description}>
          {spot.description}
        </ThemedText>

        <View style={styles.section}>
          <View style={styles.sectionLabel}>
            <SymbolView
              tintColor={theme.textSecondary}
              name={{ ios: 'mappin.circle', android: 'place', web: 'place' }}
              size={16}
            />
            <ThemedText type="smallBold" themeColor="textSecondary">
              {t('tourism.spotDetail.addressLabel')}
            </ThemedText>
          </View>
          <ThemedText style={styles.sectionValue}>{spot.address}</ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionLabel}>
            <SymbolView
              tintColor={theme.textSecondary}
              name={{ ios: 'location.circle', android: 'my_location', web: 'my_location' }}
              size={16}
            />
            <ThemedText type="smallBold" themeColor="textSecondary">
              {t('tourism.spotDetail.locationLabel')}
            </ThemedText>
          </View>
          <ThemedText type="code" style={styles.sectionValue}>
            {formatCoordinates(spot)}
          </ThemedText>
        </View>

        <ReviewList spotId={spot.id} />
      </View>
    </ScrollView>
  );
}

/**
 * 観光スポットの詳細を表示するコンポーネント。
 *
 * application 層の `useSpotDetail()` でデータを取得し、写真・名称・説明・住所・
 * 位置情報を表示する。
 */
export function SpotDetail({ spotId }: { spotId: string }) {
  const { t } = useTranslation();
  const { data: spot, isPending, isError } = useSpotDetail(spotId);

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
        <ThemedText themeColor="textSecondary">{t('tourism.spotDetail.loadError')}</ThemedText>
      </ThemedView>
    );
  }

  if (!spot) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{t('tourism.spotDetail.notFound')}</ThemedText>
      </ThemedView>
    );
  }

  return <SpotDetailContent spot={spot} />;
}
