import type { StyleProp, ViewStyle } from 'react-native';

/** 地図上に表示する緯度経度。 */
export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapProps = {
  style?: StyleProp<ViewStyle>;
  /**
   * 現在地。指定された場合のみピンを表示する。
   * `null`/`undefined`（権限拒否・取得前など）の場合はピンを出さない。
   */
  currentLocation?: MapCoordinate | null;
};
