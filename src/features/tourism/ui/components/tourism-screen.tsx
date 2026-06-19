import { StyleSheet } from 'react-native';

import { useCurrentLocation } from '@/shared/lib/geo';
import { Map, ThemedView } from '@/shared/ui';

export function TourismScreen() {
  const { coords } = useCurrentLocation();

  return (
    <ThemedView style={styles.container}>
      <Map style={styles.map} currentLocation={coords} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
