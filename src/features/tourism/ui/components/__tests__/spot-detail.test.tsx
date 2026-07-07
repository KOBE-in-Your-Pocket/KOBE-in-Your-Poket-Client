import { render, screen } from '@testing-library/react-native';
import { ActivityIndicator, Text as MockText, View as MockView } from 'react-native';

import { SpotDetail } from '../spot-detail';

import type { Spot } from '../../../domain/spot';
import type { ReactNode } from 'react';

const mockSpot: Spot = {
  id: 'nankinmachi',
  name: '南京町',
  description: '神戸の中華街。',
  address: '兵庫県神戸市中央区栄町通',
  businessHours: '10:00 - 20:00',
  genre: 'gourmet',
  category: { label: 'グルメ' },
  media: { imageUrl: 'https://example.com/nankinmachi.jpg' },
  coordinates: { latitude: 34.6889, longitude: 135.1877 },
  rating: { value: 4.2 },
};

const mockUseSpotDetail = jest.fn();
const mockSpotMannerSection = jest.fn((_props: { spotId: string }) => null);

jest.mock('../../../application/use-spot-detail', () => ({
  useSpotDetail: (spotId: string) => mockUseSpotDetail(spotId),
}));

jest.mock('@/features/manner', () => ({
  SpotMannerSection: (props: { spotId: string }) => mockSpotMannerSection(props),
}));

jest.mock('../review-list', () => ({
  ReviewList: ({ spotId }: { spotId: string }) => <MockText>{`review-list:${spotId}`}</MockText>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('expo-symbols', () => ({
  SymbolView: () => null,
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({ text: '#000000', textSecondary: '#60646C' }),
}));

jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children: ReactNode }) => <MockText>{children}</MockText>,
  ThemedView: ({ children }: { children: ReactNode }) => <MockView>{children}</MockView>,
}));

describe('SpotDetail', () => {
  afterEach(() => {
    mockUseSpotDetail.mockReset();
    mockSpotMannerSection.mockClear();
  });

  it('取得中は ActivityIndicator を表示する', () => {
    mockUseSpotDetail.mockReturnValue({ data: undefined, isPending: true, isError: false });

    render(<SpotDetail spotId="nankinmachi" />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(mockSpotMannerSection).not.toHaveBeenCalled();
  });

  it('取得失敗時はエラーメッセージを表示する', () => {
    mockUseSpotDetail.mockReturnValue({ data: undefined, isPending: false, isError: true });

    render(<SpotDetail spotId="nankinmachi" />);

    expect(screen.getByText('tourism.spotDetail.loadError')).toBeTruthy();
    expect(mockSpotMannerSection).not.toHaveBeenCalled();
  });

  it('スポット未取得時は notFound メッセージを表示する', () => {
    mockUseSpotDetail.mockReturnValue({ data: undefined, isPending: false, isError: false });

    render(<SpotDetail spotId="unknown-spot" />);

    expect(screen.getByText('tourism.spotDetail.notFound')).toBeTruthy();
    expect(mockSpotMannerSection).not.toHaveBeenCalled();
  });

  it('取得成功時は SpotMannerSection に spotId を渡して表示する', () => {
    mockUseSpotDetail.mockReturnValue({ data: mockSpot, isPending: false, isError: false });

    render(<SpotDetail spotId="nankinmachi" />);

    expect(mockUseSpotDetail).toHaveBeenCalledWith('nankinmachi');
    expect(mockSpotMannerSection).toHaveBeenCalledWith({ spotId: 'nankinmachi' });
    expect(screen.getByText(mockSpot.name)).toBeTruthy();
    expect(screen.getByText('review-list:nankinmachi')).toBeTruthy();
  });
});
