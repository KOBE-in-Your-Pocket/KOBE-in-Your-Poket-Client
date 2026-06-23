import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

import type { Spot } from '@/features/tourism';
import { useSpots } from '@/features/tourism';
import { openDirections } from '@/shared/lib/directions';
import { getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { Map, ThemedView } from '@/shared/ui';
import type { MapMarker } from '@/shared/ui';

import { useRoute } from '../../application/use-route';
import { styles } from '../styles/map-screen.styles';
import { SpotCard } from './spot-card';

/** ナビ開始時に遷移する外部地図アプリ名（OS で出し分け）。 */
const EXTERNAL_MAP_APP_NAME = Platform.OS === 'ios' ? 'Apple マップ' : 'Google マップ';

export function MapScreen() {
  const { coords } = useCurrentLocation();
  const { data: spots } = useSpots();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const spotMarkers = useMemo<MapMarker[]>(
    () =>
      (spots ?? []).map((spot) => ({
        id: spot.id,
        coordinate: spot.coordinates,
        title: spot.name,
      })),
    [spots],
  );

  const { data: route } = useRoute(coords, selectedSpot?.coordinates);

  const selectedDistanceKm = useMemo(() => {
    if (!selectedSpot || !coords) return null;
    return getDistanceKm(
      { latitude: coords.latitude, longitude: coords.longitude },
      selectedSpot.coordinates,
    );
  }, [coords, selectedSpot]);

  const handleMarkerPress = useCallback(
    (marker: MapMarker) => {
      const spot = spots?.find((candidate) => candidate.id === marker.id);
      if (spot) setSelectedSpot(spot);
    },
    [spots],
  );

  const handleClearRoute = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  // 詳細ページは未実装のため現時点では未配線。実装後にスポット詳細画面へ遷移させる。
  const handleOpenDetail = useCallback(() => {}, []);

  const handleStartNavigation = useCallback(() => {
    if (!selectedSpot) return;
    Alert.alert('ナビを開始', `※ ${EXTERNAL_MAP_APP_NAME}に移動して経路案内を開始します。`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '移動する',
        onPress: () => {
          openDirections(selectedSpot.coordinates, { origin: coords, mode: 'walking' }).catch(
            () => {
              Alert.alert('エラー', '地図アプリを開けませんでした。');
            },
          );
        },
      },
    ]);
  }, [selectedSpot, coords]);

  return (
    <ThemedView style={styles.container}>
      <Map
        style={styles.map}
        currentLocation={coords}
        markers={spotMarkers}
        onMarkerPress={handleMarkerPress}
        routeCoordinates={route?.coordinates}
      />

      {selectedSpot ? (
        <SpotCard
          spot={selectedSpot}
          distanceKm={selectedDistanceKm}
          onClose={handleClearRoute}
          onDetail={handleOpenDetail}
          onNavigate={handleStartNavigation}
        />
      ) : null}
    </ThemedView>
  );
}
