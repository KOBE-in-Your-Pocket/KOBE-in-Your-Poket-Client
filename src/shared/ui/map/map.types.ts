import type { StyleProp, ViewStyle } from 'react-native';

/** 地図上に表示する緯度経度。 */
export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

/** 地図上に表示する汎用マーカー（観光スポットなど）。 */
export type MapMarker = {
  /** マーカーの一意な識別子（React の key・タップ識別に使用）。 */
  id: string;
  coordinate: MapCoordinate;
  /** タップ時に表示する吹き出しのタイトル。 */
  title?: string;
  /** タップ時に表示する吹き出しの説明文。 */
  description?: string;
};

export type MapProps = {
  style?: StyleProp<ViewStyle>;
  /**
   * 現在地。指定された場合のみピンを表示する。
   * `null`/`undefined`（取得前・権限拒否など）の場合はピンを出さない。
   */
  currentLocation?: MapCoordinate | null;
  /** 地図上に表示するマーカー一覧（観光スポットなど）。 */
  markers?: MapMarker[];
};
