import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';

import { useSpots } from '@/features/tourism';
import { openDirections } from '@/shared/lib/directions';
import { formatDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { Map, ThemedText, ThemedView } from '@/shared/ui';
import type { MapMarker } from '@/shared/ui';

import { useRoute } from '../../application/use-route';
import { styles } from '../styles/map-screen.styles';

function formatDurationMin(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `徒歩 約${minutes}分`;
}

/** ナビ開始時に遷移する外部地図アプリ名（OS で出し分け）。 */
const EXTERNAL_MAP_APP_NAME = Platform.OS === 'ios' ? 'Apple マップ' : 'Google マップ';

export function MapScreen() {
  const { coords } = useCurrentLocation();
  const { data: spots } = useSpots();
  const [destination, setDestination] = useState<MapMarker | null>(null);

  const spotMarkers = useMemo<MapMarker[]>(
    () =>
      (spots ?? []).map((spot) => ({
        id: spot.id,
        coordinate: spot.coordinates,
        title: spot.name,
        description: spot.description,
      })),
    [spots],
  );

  const { data: route, isFetching, isError } = useRoute(coords, destination?.coordinate);

  const handleMarkerPress = useCallback((marker: MapMarker) => {
    setDestination(marker);
  }, []);

  const handleClearRoute = useCallback(() => {
    setDestination(null);
  }, []);

  const handleStartNavigation = useCallback(() => {
    if (!destination) return;
    Alert.alert('ナビを開始', `※ ${EXTERNAL_MAP_APP_NAME}に移動して経路案内を開始します。`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '移動する',
        onPress: () => {
          openDirections(destination.coordinate, { origin: coords, mode: 'walking' }).catch(() => {
            Alert.alert('エラー', '地図アプリを開けませんでした。');
          });
        },
      },
    ]);
  }, [destination, coords]);

  return (
    <ThemedView style={styles.container}>
      <Map
        style={styles.map}
        currentLocation={coords}
        markers={spotMarkers}
        onMarkerPress={handleMarkerPress}
        routeCoordinates={route?.coordinates}
      />

      {destination ? (
        <ThemedView type="backgroundElement" style={styles.routeBanner}>
          <View style={styles.routeInfo}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {destination.title}
            </ThemedText>
            <ThemedText type="small">
              {isFetching
                ? '経路を計算中…'
                : isError
                  ? '経路を取得できませんでした'
                  : route
                    ? `${formatDistanceKm(route.distanceMeters / 1000)}・${formatDurationMin(route.durationSeconds)}`
                    : '—'}
            </ThemedText>
          </View>
          <View style={styles.routeActions}>
            <Pressable
              onPress={handleStartNavigation}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="ナビを開始"
            >
              <ThemedText style={styles.navButtonText}>ナビ開始</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleClearRoute}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="経路を消す"
            >
              <ThemedText style={styles.routeClear}>消す</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}
