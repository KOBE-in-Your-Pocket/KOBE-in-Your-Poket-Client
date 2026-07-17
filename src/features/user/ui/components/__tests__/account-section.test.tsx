import '@testing-library/jest-native/extend-expect';

import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';

import type { PublicUser } from '../../../domain/public-user';
import { AccountSection } from '../account-section';

import type { ReactNode } from 'react';

jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({
    background: '#ffffff',
    backgroundElement: '#eeeeee',
    text: '#000000',
    textSecondary: '#666666',
  }),
}));

jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children?: ReactNode }) => <MockText>{children}</MockText>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let mockCurrentUser: PublicUser | null;
const mockSignOut = { mutate: jest.fn(), isPending: false };

jest.mock('../../../application/use-current-user', () => ({
  useCurrentUser: () => mockCurrentUser,
}));

jest.mock('../../../application/use-sign-out', () => ({
  useSignOut: () => mockSignOut,
}));

// SignInModal は重い依存（Google ボタン・認証フック）を含むため表示状態だけ検証する。
jest.mock('../sign-in-modal', () => ({
  SignInModal: ({ visible }: { visible: boolean }) =>
    visible ? <MockText>sign-in-modal-visible</MockText> : null,
}));

describe('AccountSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;
  });

  it('未ログイン時は「ログイン / 新規登録」行を表示し、タップでモーダルを開く', () => {
    render(<AccountSection />);

    expect(screen.queryByText('sign-in-modal-visible')).toBeNull();

    fireEvent.press(screen.getByText('settings.signIn'));

    expect(screen.getByText('sign-in-modal-visible')).toBeOnTheScreen();
  });

  it('ログイン中はユーザー名を表示し、ログアウトをタップで signOut を実行する', () => {
    mockCurrentUser = { id: 'user-1', name: 'メール 太郎', iconUrl: '' };

    render(<AccountSection />);

    expect(screen.getByText('メール 太郎')).toBeOnTheScreen();
    expect(screen.queryByText('settings.signIn')).toBeNull();

    fireEvent.press(screen.getByText('settings.signOut'));

    expect(mockSignOut.mutate).toHaveBeenCalled();
  });
});
