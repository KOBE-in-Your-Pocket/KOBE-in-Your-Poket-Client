import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text as MockText, View as MockView } from 'react-native';

import { SpotDetailContent } from '../spot-detail';

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

const mockSpotMannerSection = jest.fn((_props: { spotId: string }) => null);
const mockUseSpotReviews = jest.fn();
const mockUseCurrentUser = jest.fn();
const mockUseCurrentLocation = jest.fn();

jest.mock('../../../application/use-spot-reviews', () => ({
  useSpotReviews: (spotId: string) => mockUseSpotReviews(spotId),
}));

jest.mock('../../../application/use-update-review', () => ({
  useUpdateReview: () => jest.fn(),
}));

jest.mock('../../../application/use-delete-review', () => ({
  useDeleteReview: () => jest.fn(),
}));

jest.mock('@/features/manner', () => ({
  SpotMannerSection: (props: { spotId: string }) => mockSpotMannerSection(props),
}));

jest.mock('@/features/user', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

jest.mock('@/shared/lib/geo', () => ({
  useCurrentLocation: () => mockUseCurrentLocation(),
}));

jest.mock('@/shared/lib/directions', () => ({
  confirmOpenDirections: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('../review-form', () => ({
  ReviewForm: ({ spotId }: { spotId: string }) => <MockText>{`review-form:${spotId}`}</MockText>,
}));

jest.mock('../review-language-filter', () => ({
  ReviewLanguageFilter: () => null,
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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({
    text: '#000000',
    textSecondary: '#60646C',
    background: '#FFFFFF',
    backgroundSelected: '#F0F0F0',
  }),
}));

jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children: ReactNode }) => <MockText>{children}</MockText>,
  ThemedView: ({ children }: { children: ReactNode }) => <MockView>{children}</MockView>,
}));

describe('SpotDetailContent', () => {
  beforeEach(() => {
    mockUseSpotReviews.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseCurrentUser.mockReturnValue({ name: 'test-user' });
    mockUseCurrentLocation.mockReturnValue({ coords: null });
  });

  afterEach(() => {
    mockSpotMannerSection.mockClear();
    mockUseSpotReviews.mockReset();
  });

  it('SpotMannerSection に spotId を渡して表示する', () => {
    render(<SpotDetailContent spot={mockSpot} />);

    expect(mockSpotMannerSection).toHaveBeenCalledWith({ spotId: 'nankinmachi' });
    expect(screen.getByText(mockSpot.name)).toBeTruthy();
    expect(screen.getByText('review-form:nankinmachi')).toBeTruthy();
  });

  it('レビュー取得失敗かつ 0 件のときはエラーと再試行導線を表示し、0件表示にはしない', () => {
    mockUseSpotReviews.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
      refetch: jest.fn(),
    });

    render(<SpotDetailContent spot={mockSpot} />);

    expect(screen.getByText('tourism.reviewList.loadError')).toBeTruthy();
    expect(screen.getByText('tourism.spotDetail.reviewsRetry')).toBeTruthy();
    // 通信エラーを「レビュー0件」と混同しない。
    expect(screen.queryByText('tourism.spotDetail.noReviews')).toBeNull();
  });

  it('再試行を押すと refetch を呼ぶ', () => {
    const refetch = jest.fn();
    mockUseSpotReviews.mockReturnValue({ data: [], isPending: false, isError: true, refetch });

    render(<SpotDetailContent spot={mockSpot} />);
    fireEvent.press(screen.getByText('tourism.spotDetail.reviewsRetry'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('取得失敗でも表示できるレビューがあれば一覧を出し、エラー表示にはしない', () => {
    mockUseSpotReviews.mockReturnValue({
      data: [
        {
          id: 'own-1',
          rating: { value: 5 },
          comment: '自分の投稿',
          author: { id: 'me', name: 'me', iconUrl: 'https://example.com/a.png' },
          postedAt: '2025-05-01T00:00:00.000Z',
          language: 'ja',
        },
      ],
      isPending: false,
      isError: true,
      refetch: jest.fn(),
    });

    render(<SpotDetailContent spot={mockSpot} />);

    expect(screen.getByText('自分の投稿')).toBeTruthy();
    expect(screen.queryByText('tourism.reviewList.loadError')).toBeNull();
  });
});
