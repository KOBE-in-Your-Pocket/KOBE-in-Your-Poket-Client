import { StyleSheet } from 'react-native';

/** 現在地ドットの色（アプリのテーマブルー）。 */
const CURRENT_LOCATION_BLUE = '#208AEF';

/** 経路ライン（Polyline）の色。 */
export const ROUTE_STROKE_COLOR = '#208AEF';

export const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  currentLocationOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  currentLocationInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: CURRENT_LOCATION_BLUE,
  },
});
