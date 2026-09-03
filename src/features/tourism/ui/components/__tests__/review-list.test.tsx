import { render, screen } from '@testing-library/react-native';
import { Text as MockText, View as MockView } from 'react-native';
import type { ReactNode } from 'react';

import { ReviewList } from '../review-list';

import type { Review } from '../../../domain/review';

const mockUseSpotReviews = jest.fn();

jest.mock('../../../application/use-spot-reviews', () => ({
  useSpotReviews: (spotId: string) => mockUseSpotReviews(spotId),
}));

jest.mock('../review-form', () => ({
  ReviewForm: ({ spotId }: { spotId: string }) => <MockText>{`review-form:${spotId}`}</MockText>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ja' } }),
}));

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('expo-symbols', () => ({
  SymbolView: () => null,
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children: ReactNode }) => <MockText>{children}</MockText>,
  ThemedView: ({ children }: { children: ReactNode }) => <MockView>{children}</MockView>,
}));

function review(id: string): Review {
  return {
    id,
    rating: { value: 5 },
    comment: id,
    author: { id: 'author-1', name: 'n', iconUrl: 'https://example.com/a.png' },
    postedAt: '2025-05-01T00:00:00.000Z',
    language: 'ja',
  };
}

describe('ReviewList', () => {
  beforeEach(() => {
    mockUseSpotReviews.mockReset();
  });

  it('取得中はローディングを表示する', () => {
    mockUseSpotReviews.mockReturnValue({ data: [], isPending: true, isError: false });

    render(<ReviewList spotId="nankinmachi" />);

    expect(screen.queryByText('tourism.reviewList.empty')).toBeNull();
    expect(screen.queryByText('tourism.reviewList.loadError')).toBeNull();
  });

  it('API 障害でも表示できるレビューがあれば一覧を出し、エラー表示は出さない', () => {
    // data はローカル投稿分を含む mergeReviews 済み。isError でも隠さないことを確認する。
    mockUseSpotReviews.mockReturnValue({
      data: [review('own-review')],
      isPending: false,
      isError: true,
    });

    render(<ReviewList spotId="nankinmachi" />);

    expect(screen.getByText('own-review')).toBeTruthy();
    expect(screen.queryByText('tourism.reviewList.loadError')).toBeNull();
  });

  it('取得失敗かつ表示できるレビューが 0 件のときだけエラー表示にする', () => {
    mockUseSpotReviews.mockReturnValue({ data: [], isPending: false, isError: true });

    render(<ReviewList spotId="nankinmachi" />);

    expect(screen.getByText('tourism.reviewList.loadError')).toBeTruthy();
  });

  it('取得成功かつ 0 件なら空表示にする', () => {
    mockUseSpotReviews.mockReturnValue({ data: [], isPending: false, isError: false });

    render(<ReviewList spotId="nankinmachi" />);

    expect(screen.getByText('tourism.reviewList.empty')).toBeTruthy();
  });
});
