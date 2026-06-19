import { StyleSheet } from 'react-native';

import { Map, ThemedView } from '@/shared/ui';

export function TourismScreen() {
  return (
    <ThemedView style={styles.container}>
      <Map style={styles.map} />
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
