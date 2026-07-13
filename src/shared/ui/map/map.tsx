import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import { KOBE_INITIAL_REGION } from './kobe-initial-region';
import { ROUTE_STROKE_COLOR, styles } from './styles/map.styles';

import type { MapMarker, MapProps } from './map.types';

// TODO(#383): 現在の避難ピクトグラムは暫定画像。後日、正式な高解像度アイコンへ差し替える。
// （SVG から @resvg/resvg-js で高解像度 PNG を再生成する手順は確認済み）
const EVACUATION_MARKER_IMAGE = require('@/assets/images/evacuation-marker.png');

/**
 * 避難所マーカー: 緑地に白の避難ピクトグラム（国際標準の非常口シンボル）を表示する。
 * ピクトグラム画像は非同期ロードのため、ロード完了までは tracksViewChanges を有効にして
 * マーカーのスナップショットを更新し、完了後は無効化して無駄な再描画を止める（性能対策）。
 */
function EvacuationMarker({
  marker,
  onPress,
}: {
  marker: MapMarker;
  onPress?: (marker: MapMarker) => void;
}) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  return (
    <Marker
      coordinate={marker.coordinate}
      title={marker.title}
      description={marker.description}
      onPress={() => onPress?.(marker)}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={styles.evacuationMarker}>
        <Image
          source={EVACUATION_MARKER_IMAGE}
          style={styles.evacuationMarkerImage}
          contentFit="contain"
          onLoad={() => setTracksViewChanges(false)}
        />
      </View>
    </Marker>
  );
}

/**
 * 地図コンポーネントの雛形。
 * 初期表示は神戸市中心付近（{@link KOBE_INITIAL_REGION}）。
 * `currentLocation` が渡されたときのみ現在地ピンを表示する。
 */
export function Map({
  style,
  currentLocation,
  markers,
  onMarkerPress,
  routeCoordinates,
}: MapProps) {
  return (
    <MapView
      style={[styles.map, style]}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={KOBE_INITIAL_REGION}
    >
      {routeCoordinates && routeCoordinates.length > 1 ? (
        <Polyline coordinates={routeCoordinates} strokeColor={ROUTE_STROKE_COLOR} strokeWidth={4} />
      ) : null}
      {markers?.map((marker) =>
        marker.variant === 'evacuation' ? (
          <EvacuationMarker key={marker.id} marker={marker} onPress={onMarkerPress} />
        ) : (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress?.(marker)}
          />
        ),
      )}
      {currentLocation ? (
        <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          {/* Google/Apple マップ風の現在地ドット（白フチ + 青ドット） */}
          <View style={styles.currentLocationOuter}>
            <View style={styles.currentLocationInner} />
          </View>
        </Marker>
      ) : null}
    </MapView>
  );
}
