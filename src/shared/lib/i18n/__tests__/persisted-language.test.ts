import * as Localization from 'expo-localization';
import type { Locale } from 'expo-localization';

import { getItem } from '@/shared/lib/storage';

import { FALLBACK_LANGUAGE } from '../language';
import {
  LANGUAGE_STORAGE_KEY,
  loadPersistedLanguage,
  resolveInitialLanguage,
} from '../persisted-language';

jest.mock('@/shared/lib/storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

const mockGetItem = jest.mocked(getItem);
const mockGetLocales = jest.mocked(Localization.getLocales);

function mockLocales(languageCode: string): [Locale, ...Locale[]] {
  return [
    {
      languageTag: languageCode,
      languageCode,
      languageScriptCode: null,
      regionCode: null,
      languageRegionCode: null,
      currencyCode: null,
      currencySymbol: null,
      languageCurrencyCode: null,
      languageCurrencySymbol: null,
      decimalSeparator: '.',
      digitGroupingSeparator: ',',
      textDirection: 'ltr',
      measurementSystem: 'metric',
      temperatureUnit: 'celsius',
    },
  ];
}

describe('loadPersistedLanguage', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
  });

  it('保存済みのサポート言語を返す', async () => {
    mockGetItem.mockResolvedValue('ja');

    await expect(loadPersistedLanguage()).resolves.toBe('ja');
    expect(mockGetItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
  });

  it('未保存（null）の場合は null を返す', async () => {
    mockGetItem.mockResolvedValue(null);

    await expect(loadPersistedLanguage()).resolves.toBeNull();
  });

  it('サポート外の値が保存されている場合は null を返す', async () => {
    mockGetItem.mockResolvedValue('fr');

    await expect(loadPersistedLanguage()).resolves.toBeNull();
  });
});

describe('resolveInitialLanguage', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockGetLocales.mockReset();
  });

  it('保存済み言語があればそれを採用する', async () => {
    mockGetItem.mockResolvedValue('ko');
    mockGetLocales.mockReturnValue(mockLocales('ja'));

    await expect(resolveInitialLanguage()).resolves.toBe('ko');
  });

  it('保存値が無い場合はデバイス言語へフォールバックする', async () => {
    mockGetItem.mockResolvedValue(null);
    mockGetLocales.mockReturnValue(mockLocales('ja'));

    await expect(resolveInitialLanguage()).resolves.toBe('ja');
  });

  it('保存値が無くデバイス言語も非サポートの場合は en へフォールバックする', async () => {
    mockGetItem.mockResolvedValue(null);
    mockGetLocales.mockReturnValue(mockLocales('fr'));

    await expect(resolveInitialLanguage()).resolves.toBe(FALLBACK_LANGUAGE);
  });
});
