/// <reference types="jest" />
import { renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import {
  createDevDefaultCoords,
  SANNOMIYA_STATION_COORDS,
  shouldUseDevDefaultLocation,
} from '../dev-default-coordinates';
import { useCurrentLocation } from '../hooks/use-current-location';

jest.mock('expo-location');
jest.mock('../dev-default-coordinates', () => ({
  ...jest.requireActual('../dev-default-coordinates'),
  shouldUseDevDefaultLocation: jest.fn(() => false),
}));

const mockedShouldUseDevDefaultLocation = shouldUseDevDefaultLocation as jest.MockedFunction<
  typeof shouldUseDevDefaultLocation
>;

const mockedRequestPermissions = Location.requestForegroundPermissionsAsync as jest.MockedFunction<
  typeof Location.requestForegroundPermissionsAsync
>;
const mockedGetCurrentPosition = Location.getCurrentPositionAsync as jest.MockedFunction<
  typeof Location.getCurrentPositionAsync
>;

const sampleCoords: Location.LocationObjectCoords = {
  latitude: 34.69,
  longitude: 135.195,
  altitude: null,
  accuracy: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
};

describe('useCurrentLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedShouldUseDevDefaultLocation.mockReturnValue(false);
  });

  it('returns coords when permission is granted', async () => {
    mockedRequestPermissions.mockResolvedValue({
      status: 'granted',
    } as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);
    mockedGetCurrentPosition.mockResolvedValue({
      coords: sampleCoords,
      timestamp: 0,
    });

    const { result } = renderHook(() => useCurrentLocation());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coords).toEqual(sampleCoords);
    expect(result.current.error).toBeNull();
    expect(result.current.permissionDenied).toBe(false);
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('flags permissionDenied and sets an error when permission is denied', async () => {
    mockedRequestPermissions.mockResolvedValue({
      status: 'denied',
    } as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.permissionDenied).toBe(true);
    expect(mockedGetCurrentPosition).not.toHaveBeenCalled();
  });

  it('sets an error when getCurrentPositionAsync throws', async () => {
    mockedRequestPermissions.mockResolvedValue({
      status: 'granted',
    } as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);
    mockedGetCurrentPosition.mockRejectedValue(new Error('location unavailable'));

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coords).toBeNull();
    expect(result.current.error).toEqual(new Error('location unavailable'));
    expect(result.current.permissionDenied).toBe(false);
  });

  it('uses Sannomiya Station as default in dev environments', async () => {
    mockedShouldUseDevDefaultLocation.mockReturnValue(true);

    const { result } = renderHook(() => useCurrentLocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coords).toEqual(createDevDefaultCoords());
    expect(result.current.coords).toEqual(SANNOMIYA_STATION_COORDS);
    expect(result.current.error).toBeNull();
    expect(result.current.permissionDenied).toBe(false);
    expect(mockedRequestPermissions).not.toHaveBeenCalled();
    expect(mockedGetCurrentPosition).not.toHaveBeenCalled();
  });
});
