import { Platform, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { KOBE_INITIAL_REGION } from './kobe-initial-region';

import type { MapProps } from './map.types';

/**
 * 地図コンポーネントの雛形。
 * 初期表示は神戸市中心付近（{@link KOBE_INITIAL_REGION}）。
 */
export function Map({ style }: MapProps) {
  return (
    <MapView
      style={[styles.map, style]}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={KOBE_INITIAL_REGION}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
