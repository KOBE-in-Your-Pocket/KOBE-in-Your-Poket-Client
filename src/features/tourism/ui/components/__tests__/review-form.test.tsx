import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text as MockText, View as MockView } from 'react-native';

import { useAuthStore } from '@/features/user';

import { ReviewForm } from '../review-form';

import type { ReactNode } from 'react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ja' } }),
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#60646C',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
  }),
}));

// user の公開 API 経由で読み込む shared/ui バレルは Reanimated / react-native-maps
// などネイティブ UI を含む。このテストでは描画のみ必要なので軽量スタブへ差し替える。
jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children?: ReactNode }) => <MockText>{children}</MockText>,
  ThemedView: ({ children }: { children?: ReactNode }) => <MockView>{children}</MockView>,
}));

jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('expo-symbols', () => ({ SymbolView: () => null }));

const USER = { name: '荒川蓮', iconUrl: 'https://i.pravatar.cc/150?img=68' };
const OTHER_USER = { name: '山田花子', iconUrl: 'https://example.com/hanako.png' };
const PLACEHOLDER_LABEL = 'tourism.reviewForm.placeholder';
const COMMENT_PLACEHOLDER = 'tourism.reviewForm.commentPlaceholder';

describe('ReviewForm', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('未ログイン時は何も表示しない', () => {
    render(<ReviewForm spotId="spot-a" />);

    expect(screen.queryByLabelText(PLACEHOLDER_LABEL)).toBeNull();
  });

  it('ログアウトで下書きを破棄し、再ログイン時に入力が残らない', () => {
    act(() => {
      useAuthStore.getState().login(USER);
    });
    render(<ReviewForm spotId="spot-a" />);

    // 展開して下書きを入力する
    fireEvent.press(screen.getByLabelText(PLACEHOLDER_LABEL));
    fireEvent.changeText(screen.getByPlaceholderText(COMMENT_PLACEHOLDER), '書きかけの下書き');
    expect(screen.getByPlaceholderText(COMMENT_PLACEHOLDER).props.value).toBe('書きかけの下書き');

    // ログアウト → フォーム非表示
    act(() => {
      useAuthStore.getState().logout();
    });
    expect(screen.queryByPlaceholderText(COMMENT_PLACEHOLDER)).toBeNull();
    expect(screen.queryByLabelText(PLACEHOLDER_LABEL)).toBeNull();

    // 再ログイン → 折りたたみ状態で復帰し、下書きは消えている
    act(() => {
      useAuthStore.getState().login(USER);
    });
    expect(screen.getByLabelText(PLACEHOLDER_LABEL)).toBeTruthy();
    fireEvent.press(screen.getByLabelText(PLACEHOLDER_LABEL));
    expect(screen.getByPlaceholderText(COMMENT_PLACEHOLDER).props.value).toBe('');
  });

  it('別ユーザーへ切り替わった際も下書きを持ち越さない（logout を挟まない切替）', () => {
    act(() => {
      useAuthStore.getState().login(USER);
    });
    render(<ReviewForm spotId="spot-a" />);

    // USER で下書きを入力する
    fireEvent.press(screen.getByLabelText(PLACEHOLDER_LABEL));
    fireEvent.changeText(screen.getByPlaceholderText(COMMENT_PLACEHOLDER), '前のユーザーの下書き');
    expect(screen.getByPlaceholderText(COMMENT_PLACEHOLDER).props.value).toBe(
      '前のユーザーの下書き',
    );

    // logout を挟まず別ユーザーへ切り替え → 折りたたみに戻り下書きは消えている
    act(() => {
      useAuthStore.getState().login(OTHER_USER);
    });
    expect(screen.queryByPlaceholderText(COMMENT_PLACEHOLDER)).toBeNull();
    fireEvent.press(screen.getByLabelText(PLACEHOLDER_LABEL));
    expect(screen.getByPlaceholderText(COMMENT_PLACEHOLDER).props.value).toBe('');
  });
});
