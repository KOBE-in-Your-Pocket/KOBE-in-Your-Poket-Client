import { useMemo } from 'react';

import { useSpots } from '@/features/tourism';
import { useCurrentLocation } from '@/shared/lib/geo';
import { Map, ThemedView } from '@/shared/ui';
import type { MapMarker } from '@/shared/ui';

import { styles } from '../styles/map-screen.styles';

export function MapScreen() {
  const { coords } = useCurrentLocation();
  const { data: spots } = useSpots();

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

  return (
    <ThemedView style={styles.container}>
      <Map style={styles.map} currentLocation={coords} markers={spotMarkers} />
    </ThemedView>
  );
}
