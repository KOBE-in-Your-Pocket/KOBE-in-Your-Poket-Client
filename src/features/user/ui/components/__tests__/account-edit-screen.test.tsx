import { fireEvent, render, screen, within } from '@testing-library/react-native';
import {
  Text as MockText,
  View as MockView,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useCurrentUser } from '../../../application/use-current-user';
import { AccountEditScreen } from '../account-edit-screen';
import { PRESET_AVATAR_URLS } from '../avatar-picker';

import type { ReactNode } from 'react';

jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
  MaxContentWidth: 800,
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => (
    <MockText style={style}>{children}</MockText>
  ),
  ThemedView: ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
    <MockView style={style}>{children}</MockView>
  ),
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// 画像 URI の受け渡しだけ検証できれば十分なので、uri を testID として露出する軽量モックにする。
jest.mock('expo-image', () => ({
  Image: ({ source }: { source: { uri: string } }) => <MockView testID={`image-${source.uri}`} />,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: ReactNode }) => <MockView>{children}</MockView>,
}));

jest.mock('../../../application/use-current-user', () => ({
  useCurrentUser: jest.fn(),
}));

const mockUseCurrentUser = useCurrentUser as jest.Mock;

describe('AccountEditScreen', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue({ name: '荒川蓮', iconUrl: PRESET_AVATAR_URLS[0] });
  });

  it('現在ユーザーの表示名とアイコンを初期表示する', () => {
    render(<AccountEditScreen />);

    expect(screen.getByDisplayValue('荒川蓮')).toBeTruthy();

    const selected = screen.getByRole('radio', { selected: true });
    expect(within(selected).getByTestId(`image-${PRESET_AVATAR_URLS[0]}`)).toBeTruthy();
  });

  it('別のアイコンを選ぶと選択とプレビューが切り替わる', () => {
    render(<AccountEditScreen />);

    const options = screen.getAllByRole('radio');
    fireEvent.press(options[1]);

    const selected = screen.getByRole('radio', { selected: true });
    expect(within(selected).getByTestId(`image-${PRESET_AVATAR_URLS[1]}`)).toBeTruthy();
    // プレビューと選択中オプションの2箇所に同じ URI が表示される。
    expect(screen.getAllByTestId(`image-${PRESET_AVATAR_URLS[1]}`)).toHaveLength(2);
  });

  it('表示名が空白のみのとき保存ボタンが無効になる', () => {
    render(<AccountEditScreen />);

    const input = screen.getByDisplayValue('荒川蓮');

    fireEvent.changeText(input, '   ');
    expect(screen.getByRole('button', { disabled: true })).toBeTruthy();

    fireEvent.changeText(input, '新しい名前');
    expect(screen.getByRole('button', { disabled: false })).toBeTruthy();
  });
});
