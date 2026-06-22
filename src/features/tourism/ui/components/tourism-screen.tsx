import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { useCurrentLocation } from '@/shared/lib/geo';
import { LocationPermissionNotice, Map, ThemedView } from '@/shared/ui';


export function TourismScreen() {
  const { coords, permissionDenied } = useCurrentLocation();


  return (
    <ThemedView style={styles.container}>
      <Map style={styles.map} currentLocation={coords} />
      {permissionDenied ? (
        <SafeAreaView style={styles.noticeOverlay} pointerEvents="box-none">
          <LocationPermissionNotice />
        </SafeAreaView>
      ) : null}
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
  noticeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
  },
});
