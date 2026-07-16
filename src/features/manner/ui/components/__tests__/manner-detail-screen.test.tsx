import { render, screen } from '@testing-library/react-native';
import { ActivityIndicator, Text as MockText, View as MockView } from 'react-native';

import { MannerDetailScreen } from '../manner-detail-screen';

import type { MannerItem } from '../../../domain/manner-item';
import type { ReactNode } from 'react';

const mockManner: MannerItem = {
  id: 'no-eating-while-walking',
  title: '食べ歩き禁止',
  description: '指定の飲食スペース以外での食べ歩きはご遠慮ください。',
  icon: 'no-eating-while-walking',
  imageKey: null,
  kind: 'rule',
  scope: 'local',
  relatedSpotIds: [],
};

const mockUseMannerDetail = jest.fn();

jest.mock('../../styles/manner-detail.styles', () => ({
  styles: {
    container: {},
    centered: {},
  },
}));

jest.mock('../../hooks/use-manner-detail', () => ({
  useMannerDetail: (mannerId: string) => mockUseMannerDetail(mannerId),
}));

jest.mock('../manner-detail', () => ({
  MannerDetailContent: ({ manner }: { manner: MannerItem }) => (
    <MockText>{`manner-detail-content:${manner.title}`}</MockText>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children: ReactNode }) => <MockText>{children}</MockText>,
  ThemedView: ({ children }: { children: ReactNode }) => <MockView>{children}</MockView>,
}));

describe('MannerDetailScreen', () => {
  beforeEach(() => {
    mockUseMannerDetail.mockReturnValue({ data: mockManner, isPending: false, isError: false });
  });

  afterEach(() => {
    mockUseMannerDetail.mockReset();
  });

  it('useMannerDetail に mannerId を渡す', () => {
    render(<MannerDetailScreen mannerId="no-eating-while-walking" />);

    expect(mockUseMannerDetail).toHaveBeenCalledWith('no-eating-while-walking');
  });

  it('取得中はローディング表示', () => {
    mockUseMannerDetail.mockReturnValue({ data: undefined, isPending: true, isError: false });

    render(<MannerDetailScreen mannerId="no-eating-while-walking" />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText('manner.detail.loadError')).toBeNull();
    expect(screen.queryByText('manner.detail.notFound')).toBeNull();
  });

  it('取得エラー時は loadError を表示する', () => {
    mockUseMannerDetail.mockReturnValue({ data: undefined, isPending: false, isError: true });

    render(<MannerDetailScreen mannerId="no-eating-while-walking" />);

    expect(screen.getByText('manner.detail.loadError')).toBeTruthy();
    expect(screen.queryByText(`manner-detail-content:${mockManner.title}`)).toBeNull();
  });

  it('マナー未検出時は notFound を表示する', () => {
    mockUseMannerDetail.mockReturnValue({ data: null, isPending: false, isError: false });

    render(<MannerDetailScreen mannerId="unknown" />);

    expect(screen.getByText('manner.detail.notFound')).toBeTruthy();
    expect(screen.queryByText(`manner-detail-content:${mockManner.title}`)).toBeNull();
  });

  it('取得成功時は MannerDetailContent に manner を渡して表示する', () => {
    render(<MannerDetailScreen mannerId="no-eating-while-walking" />);

    expect(screen.getByText('manner-detail-content:食べ歩き禁止')).toBeTruthy();
    expect(screen.queryByText('manner.detail.loadError')).toBeNull();
    expect(screen.queryByText('manner.detail.notFound')).toBeNull();
  });
});
