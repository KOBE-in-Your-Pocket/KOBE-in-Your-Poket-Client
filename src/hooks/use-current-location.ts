import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type CurrentLocationCoords = Location.LocationObjectCoords;

export type UseCurrentLocationResult = {
  loading: boolean;
  error: Error | null;
  coords: CurrentLocationCoords | null;
};

export function useCurrentLocation(): UseCurrentLocationResult {
  const [coords, setCoords] = useState<CurrentLocationCoords | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (status !== 'granted') {
          setError(new Error('Location permission was not granted'));
          return;
        }

        const position = await Location.getCurrentPositionAsync();
        if (cancelled) return;

        setCoords(position.coords);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, error, coords };
}
