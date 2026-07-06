import { render, screen } from '@testing-library/react-native';
import { ActivityIndicator, Text as MockText, View as MockView } from 'react-native';

import { MannerList } from '../manner-list';

import type { MannerItem } from '../../../domain/manner-item';
import type { ReactNode } from 'react';

const mockManners: MannerItem[] = [
  {
    id: 'no-eating-while-walking',
    title: '食べ歩き禁止',
    description: '指定の飲食スペース以外での食べ歩きはご遠慮ください。',
    icon: 'no-eating-while-walking',
    kind: 'rule',
    scope: 'local',
    relatedSpotIds: ['nankinmachi'],
  },
];

// jest.mock ファクトリから参照するため mock プレフィックスを付ける（out-of-scope 変数制約）。
const mockUseManners = jest.fn();

jest.mock('../../hooks/use-manners', () => ({
  useManners: () => mockUseManners(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../manner-icon', () => ({
  MannerIcon: () => null,
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({ text: '#000000', textSecondary: '#60646C', backgroundElement: '#F0F0F3' }),
}));

jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
  BottomTabInset: 48,
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children: ReactNode }) => <MockText>{children}</MockText>,
  ThemedView: ({ children }: { children: ReactNode }) => <MockView>{children}</MockView>,
}));

describe('MannerList', () => {
  afterEach(() => {
    mockUseManners.mockReset();
  });

  it('取得中は ActivityIndicator を表示する', () => {
    mockUseManners.mockReturnValue({ data: undefined, isPending: true, isError: false });

    render(<MannerList />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('取得失敗時はエラーメッセージを表示する', () => {
    mockUseManners.mockReturnValue({ data: undefined, isPending: false, isError: true });

    render(<MannerList />);

    expect(screen.getByText('manner.list.loadError')).toBeTruthy();
  });

  it('0件のときは空メッセージを表示する', () => {
    mockUseManners.mockReturnValue({ data: [], isPending: false, isError: false });

    render(<MannerList />);

    expect(screen.getByText('manner.list.empty')).toBeTruthy();
  });

  it('取得成功時はヘッダーと各項目のタイトル・説明を表示する', () => {
    mockUseManners.mockReturnValue({ data: mockManners, isPending: false, isError: false });

    render(<MannerList />);

    expect(screen.getByText('manner.list.title')).toBeTruthy();
    expect(screen.getByText(mockManners[0].title)).toBeTruthy();
    expect(screen.getByText(mockManners[0].description)).toBeTruthy();
  });
});
