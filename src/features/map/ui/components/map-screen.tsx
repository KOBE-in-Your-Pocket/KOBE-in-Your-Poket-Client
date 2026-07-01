import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEvacuationShelters } from '@/features/evacuation';
import type { Spot } from '@/features/tourism';
import { useSpots } from '@/features/tourism';
import { confirmOpenDirections } from '@/shared/lib/directions';
import { getDistanceKm, useCurrentLocation } from '@/shared/lib/geo';
import { LocationServicesModal, Map, ThemedView } from '@/shared/ui';
import type { MapMarker } from '@/shared/ui';

import { useRoute } from '../../application/use-route';
import { useMapModeStore } from '../../store/use-map-mode-store';
import { styles } from '../styles/map-screen.styles';
import { MapModeToggle } from './map-mode-toggle';
import { SpotCard } from './spot-card';

export function MapScreen() {
  const { t } = useTranslation();
  const { coords, servicesDisabled, permissionDenied } = useCurrentLocation();
  const mapMode = useMapModeStore((state) => state.mapMode);
  const { data: spots } = useSpots();
  const { data: shelters } = useEvacuationShelters();
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

  // 地図モードに応じて表示するピンを出し分ける。
  // tourism: 観光名所（useSpots）／evacuation: 避難所（useEvacuationShelters）。
  // mapMode は zustand ストアなので、モード切替で即座に markers が再計算・再描画される。
  const markers = useMemo<MapMarker[]>(() => {
    if (mapMode === 'evacuation') {
      return (shelters ?? []).map((shelter) => ({
        id: shelter.id,
        coordinate: shelter.coordinates,
        title: shelter.name,
        description: shelter.address,
        variant: 'evacuation',
      }));
    }
    return (spots ?? []).map((spot) => ({
      id: spot.id,
      coordinate: spot.coordinates,
      title: spot.name,
    }));
  }, [mapMode, spots, shelters]);

  // 観光地リストの「経路」ボタンから spotId 付きで遷移してきたら、その地点を選択状態にする。
  // render 中に前回適用した spotId と比較して反映する（effect 内 setState を避ける公式パターン）。
  // spots が後から読み込まれた場合も、該当スポットが見つかった時点で一度だけ適用される。
  // spotId は観光導線からのみ渡るため、観光モードのときだけ適用する。
  if (mapMode === 'tourism' && spotId && spotId !== appliedSpotId) {
    const spot = spots?.find((candidate) => candidate.id === spotId);
    if (spot) {
      setAppliedSpotId(spotId);
      setSelectedSpot(spot);
    }
  }

  // 避難モードへ切り替えたら観光スポットの選択を解除する。
  // 保持したままだと観光モードへ戻った際に、ユーザーが開いていない SpotCard が再表示されてしまう。
  // deep-link 反映と同じく、effect ではなく render 中に調整する公式パターンで揃える。
  if (mapMode !== 'tourism' && selectedSpot !== null) {
    setSelectedSpot(null);
  }

  // スポット選択（カード・経路）は観光モード専用。避難モードでは目的地を渡さず経路取得もしない。
  const routeDestination = mapMode === 'tourism' ? selectedSpot?.coordinates : undefined;
  const { data: route } = useRoute(coords, routeDestination);

  const selectedDistanceKm = useMemo(() => {
    if (!selectedSpot || !coords) return null;
    return getDistanceKm(
      { latitude: coords.latitude, longitude: coords.longitude },
      selectedSpot.coordinates,
    );
  }, [coords, selectedSpot]);

  const handleMarkerPress = useCallback(
    (marker: MapMarker) => {
      // 避難所ピンの選択詳細は本 Issue の範囲外。タップ時は吹き出し（title/description）のみ表示する。
      if (mapMode !== 'tourism') return;
      const spot = spots?.find((candidate) => candidate.id === marker.id);
      if (spot) setSelectedSpot(spot);
    },
    [mapMode, spots],
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
        markers={markers}
        onMarkerPress={handleMarkerPress}
        routeCoordinates={mapMode === 'tourism' ? route?.coordinates : undefined}
      />

      <MapModeToggle />

      {mapMode === 'tourism' && selectedSpot ? (
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
