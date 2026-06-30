import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Spot } from '@/features/tourism';
import { useSpots } from '@/features/tourism';
import { confirmOpenDirections } from '@/shared/lib/directions';
import { getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { LocationServicesModal, Map, ThemedView } from '@/shared/ui';
import type { MapMarker } from '@/shared/ui';

import { useRoute } from '../../application/use-route';
import { styles } from '../styles/map-screen.styles';
import { MapModeToggle } from './map-mode-toggle';
import { SpotCard } from './spot-card';

export function MapScreen() {
  const { t } = useTranslation();
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

  const handleOpenDetail = useCallback(() => {
    if (!selectedSpot) return;
    router.push({ pathname: '/tourism/[id]', params: { id: selectedSpot.id } });
  }, [selectedSpot]);

  const handleStartNavigation = useCallback(() => {
    if (!selectedSpot) return;
    confirmOpenDirections(t, selectedSpot.coordinates, { origin: coords });
  }, [selectedSpot, coords, t]);

  return (
    <ThemedView style={styles.container}>
      <Map
        style={styles.map}
        currentLocation={coords}
        markers={spotMarkers}
        onMarkerPress={handleMarkerPress}
        routeCoordinates={route?.coordinates}
      />

      <MapModeToggle />

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
