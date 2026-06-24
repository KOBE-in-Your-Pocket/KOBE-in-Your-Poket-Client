import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

import type { Spot } from '@/features/tourism';
import { useSpots } from '@/features/tourism';
import { openDirections } from '@/shared/lib/directions';
import { getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { LocationServicesModal, Map, ThemedView } from '@/shared/ui';
import type { MapMarker } from '@/shared/ui';

import { useRoute } from '../../application/use-route';
import { styles } from '../styles/map-screen.styles';
import { SpotCard } from './spot-card';

/** ナビ開始時に遷移する外部地図アプリ名（OS で出し分け）。 */
const EXTERNAL_MAP_APP_NAME = Platform.OS === 'ios' ? 'Apple マップ' : 'Google マップ';

export function MapScreen() {
  const { coords, servicesDisabled, permissionDenied } = useCurrentLocation();
  const { data: spots } = useSpots();
  const { spotId } = useLocalSearchParams<{ spotId?: string }>();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [appliedSpotId, setAppliedSpotId] = useState<string | undefined>(undefined);
  const [showServicesModal, setShowServicesModal] = useState(false);

  // 一度でも現在地が取れたあとに、位置情報が使えなくなった瞬間だけモーダルを開く。
  // iOS ではサービスのグローバルオフが権限拒否として返ることもあるため、
  // servicesDisabled / permissionDenied のどちらでもオフとして扱う。
  // オフの間は coords が null になり、現在地ピンは地図上から消える。
  const wasLocationAvailable = useRef(false);
  useEffect(() => {
    if (coords) {
      wasLocationAvailable.current = true;
      return;
    }
    if ((servicesDisabled || permissionDenied) && wasLocationAvailable.current) {
      setShowServicesModal(true);
    }
  }, [coords, servicesDisabled, permissionDenied]);

  const handleCloseServicesModal = useCallback(() => {
    setShowServicesModal(false);
  }, []);

  const spotMarkers = useMemo<MapMarker[]>(
    () =>
      (spots ?? []).map((spot) => ({
        id: spot.id,
        coordinate: spot.coordinates,
        title: spot.name,
      })),
    [spots],
  );

  // 観光地リストの「経路」ボタンから spotId 付きで遷移してきたら、その地点を選択状態にする。
  // render 中に前回適用した spotId と比較して反映する（effect 内 setState を避ける公式パターン）。
  // spots が後から読み込まれた場合も、該当スポットが見つかった時点で一度だけ適用される。
  if (spotId && spotId !== appliedSpotId) {
    const spot = spots?.find((candidate) => candidate.id === spotId);
    if (spot) {
      setAppliedSpotId(spotId);
      setSelectedSpot(spot);
    }
  }

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

      <LocationServicesModal visible={showServicesModal} onClose={handleCloseServicesModal} />
    </ThemedView>
  );
}
