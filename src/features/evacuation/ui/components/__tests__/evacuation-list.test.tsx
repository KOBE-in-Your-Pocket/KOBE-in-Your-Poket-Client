import { render, screen } from '@testing-library/react-native';
import {
  Text as MockText,
  View as MockView,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { EvacuationList } from '../evacuation-list';

import type { EvacuationShelter } from '../../../domain/evacuation-shelter';
import type { ReactNode } from 'react';

const mockShelters: EvacuationShelter[] = [
  {
    id: 'shelter-1',
    name: '避難所A',
    address: '住所A',
    coordinates: { latitude: 34.69, longitude: 135.19 },
    type: 'designated',
    facilityCategory: 'school',
    media: { imageUrl: '' },
    accessible: true,
  },
];

// jest.mock ファクトリから参照するため mock プレフィックスを付ける（out-of-scope 変数制約）。
const mockUseCurrentLocation = jest.fn();

jest.mock('../../../application/use-evacuation-shelters', () => ({
  useEvacuationShelters: () => ({ data: mockShelters, isPending: false, isError: false }),
}));

jest.mock('@/shared/lib/geo', () => ({
  useCurrentLocation: () => mockUseCurrentLocation(),
  getDistanceKm: () => 1,
  formatDistanceKm: (km: number) => `${km} km`,
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({
    text: '#000000',
    textSecondary: '#60646C',
    background: '#FFFFFF',
  }),
}));

jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => (
    <MockText style={style}>{children}</MockText>
  ),
  ThemedView: ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
    <MockView style={style}>{children}</MockView>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('EvacuationList の位置情報フォールバック表示', () => {
  beforeEach(() => {
    mockUseCurrentLocation.mockReturnValue({
      coords: { latitude: 34.694722, longitude: 135.195833 },
      permissionDenied: false,
      servicesDisabled: false,
    });
  });

  it('位置情報が取得できている場合、バナーを表示しない', () => {
    render(<EvacuationList />);

    expect(screen.queryByText('location.permissionDeniedNotice')).toBeNull();
    expect(screen.queryByText('evacuation.list.locationServicesDisabled')).toBeNull();
  });

  it('permissionDenied のとき、権限拒否バナーを表示する', () => {
    mockUseCurrentLocation.mockReturnValue({
      coords: null,
      permissionDenied: true,
      servicesDisabled: false,
    });

    render(<EvacuationList />);

    expect(screen.getByText('location.permissionDeniedNotice')).toBeTruthy();
  });

  it('servicesDisabled のとき、サービスオフバナーを表示する', () => {
    mockUseCurrentLocation.mockReturnValue({
      coords: null,
      permissionDenied: false,
      servicesDisabled: true,
    });

    render(<EvacuationList />);

    expect(screen.getByText('evacuation.list.locationServicesDisabled')).toBeTruthy();
  });

  it('permissionDenied でも一覧自体は表示され続ける', () => {
    mockUseCurrentLocation.mockReturnValue({
      coords: null,
      permissionDenied: true,
      servicesDisabled: false,
    });

    render(<EvacuationList />);

    expect(screen.getByText('避難所A')).toBeTruthy();
  });

  it('showHeader=false でも位置情報バナーは表示される', () => {
    mockUseCurrentLocation.mockReturnValue({
      coords: null,
      permissionDenied: true,
      servicesDisabled: false,
    });

    render(<EvacuationList showHeader={false} />);

    expect(screen.getByText('location.permissionDeniedNotice')).toBeTruthy();
    expect(screen.queryByText('evacuation.list.title')).toBeNull();
  });

  it('showHeader=false かつ位置情報も正常な場合、ヘッダー要素は何も表示しない', () => {
    render(<EvacuationList showHeader={false} />);

    expect(screen.queryByText('evacuation.list.title')).toBeNull();
    expect(screen.queryByText('location.permissionDeniedNotice')).toBeNull();
    expect(screen.getByText('避難所A')).toBeTruthy();
  });
});
