import '@testing-library/jest-native/extend-expect';

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text as MockText, View as MockView } from 'react-native';

import { PRIVACY_POLICY_VERSION } from '../../../domain/privacy-policy';
import { PrivacyConsentGate } from '../privacy-consent-gate';

import type { ReactNode } from 'react';

jest.mock('@/shared/config', () => ({
  MaxContentWidth: 800,
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

// @/shared/ui バレルは Reanimated 等を巻き込むため軽量スタブへ差し替える。
jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children }: { children?: ReactNode }) => <MockText>{children}</MockText>,
  ThemedView: ({ children }: { children?: ReactNode }) => <MockView>{children}</MockView>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ja' } }),
}));

const mockOpenBrowserAsync = jest.fn().mockResolvedValue({ type: 'dismiss' });
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpenBrowserAsync(...args),
  WebBrowserPresentationStyle: { AUTOMATIC: 'automatic' },
}));

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
jest.mock('@/shared/lib/storage', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const Child = () => <MockText>app-content</MockText>;

describe('PrivacyConsentGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
  });

  it('同意済みなら子要素を描画する', async () => {
    mockGetItem.mockResolvedValue({
      version: PRIVACY_POLICY_VERSION,
      agreedAt: '2026-09-07T00:00:00.000Z',
    });

    render(
      <PrivacyConsentGate>
        <Child />
      </PrivacyConsentGate>,
    );

    expect(await screen.findByText('app-content')).toBeTruthy();
  });

  it('未同意なら同意画面を出し、子要素を描画しない', async () => {
    render(
      <PrivacyConsentGate>
        <Child />
      </PrivacyConsentGate>,
    );

    expect(await screen.findByText('legal.consent.accept')).toBeTruthy();
    expect(screen.queryByText('app-content')).toBeNull();
  });

  it('同意ボタンで記録を保存し、アプリ本体へ進む', async () => {
    render(
      <PrivacyConsentGate>
        <Child />
      </PrivacyConsentGate>,
    );

    fireEvent.press(await screen.findByText('legal.consent.accept'));

    await waitFor(() => expect(screen.getByText('app-content')).toBeTruthy());
    expect(mockSetItem).toHaveBeenCalledWith('legal.privacyPolicyConsent', {
      version: PRIVACY_POLICY_VERSION,
      agreedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
  });

  it('保存に失敗した場合はエラーを表示し、同意画面に留まる', async () => {
    mockSetItem.mockRejectedValue(new Error('write failed'));

    render(
      <PrivacyConsentGate>
        <Child />
      </PrivacyConsentGate>,
    );

    fireEvent.press(await screen.findByText('legal.consent.accept'));

    expect(await screen.findByText('legal.consent.saveError')).toBeTruthy();
    expect(screen.queryByText('app-content')).toBeNull();
  });

  it('リンク押下で表示言語のポリシー URL をアプリ内ブラウザで開く', async () => {
    render(
      <PrivacyConsentGate>
        <Child />
      </PrivacyConsentGate>,
    );

    fireEvent.press(await screen.findByText('legal.consent.readPolicy'));

    await waitFor(() =>
      expect(mockOpenBrowserAsync).toHaveBeenCalledWith(
        'https://kobe-in-your-pocket.github.io/privacy/ja/',
        expect.anything(),
      ),
    );
  });
});
