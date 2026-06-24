import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { createDevDefaultCoords, shouldUseDevDefaultLocation } from '../dev-default-coordinates';

export type CurrentLocationCoords = Location.LocationObjectCoords;

export type UseCurrentLocationResult = {
  loading: boolean;
  error: Error | null;
  coords: CurrentLocationCoords | null;
  /** 位置情報の権限が拒否された場合に true。注意文表示の出し分けに使う。 */
  permissionDenied: boolean;
  /** 端末側で位置情報サービス（GPS）がオフの場合に true。 */
  servicesDisabled: boolean;
};

export function useCurrentLocation(): UseCurrentLocationResult {
  const [coords, setCoords] = useState<CurrentLocationCoords | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [servicesDisabled, setServicesDisabled] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    // 権限・サービス状態・現在地を一通り評価する。
    // 初回マウント時だけでなく、アプリがフォアグラウンドに復帰したとき（設定アプリで
    // 位置情報をオン/オフした直後など）にも呼び、起動後の状態変化を取りこぼさない。
    const resolveLocation = async () => {
      try {
        if (shouldUseDevDefaultLocation(Device.isDevice, Platform.OS)) {
          if (cancelled) return;
          setServicesDisabled(false);
          setPermissionDenied(false);
          setError(null);
          setCoords(createDevDefaultCoords());
          return;
        }

        // 端末側の位置情報サービスがオフかどうかを最初に確認する。
        // iOS では位置情報サービスをグローバルにオフにすると権限ステータスが
        // 'denied' として返ることがあり、権限チェックを先に行うと
        // サービスオフ（servicesDisabled）を取りこぼすため、ここを優先する。
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (cancelled) return;

        if (!servicesEnabled) {
          setServicesDisabled(true);
          setPermissionDenied(false);
          setError(new Error('Location services are disabled'));
          setCoords(null);
          return;
        }
        setServicesDisabled(false);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (status !== 'granted') {
          setPermissionDenied(true);
          setError(new Error('Location permission was not granted'));
          setCoords(null);
          return;
        }
        setPermissionDenied(false);

        const position = await Location.getCurrentPositionAsync();
        if (cancelled) return;

        setError(null);
        setCoords(position.coords);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setCoords(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void resolveLocation();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void resolveLocation();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return { loading, error, coords, permissionDenied, servicesDisabled };
}
