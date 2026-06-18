import { FALLBACK_LANGUAGE, resolveLanguage, SUPPORTED_LANGUAGES } from '../language';

describe('resolveLanguage', () => {
  it.each([
    ['ja', 'ja'],
    ['en', 'en'],
    ['zh', 'zh'],
    ['ko', 'ko'],
  ] as const)('サポート言語 %s はそのまま返す', (input, expected) => {
    expect(resolveLanguage(input)).toBe(expected);
  });

  it.each(['fr', 'de', 'es', 'pt', 'it'])(
    'サポート外の言語 %s は en にフォールバックする',
    (input) => {
      expect(resolveLanguage(input)).toBe(FALLBACK_LANGUAGE);
    },
  );

  it('SUPPORTED_LANGUAGES に ja, en, zh, ko が含まれる', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['ja', 'en', 'zh', 'ko']);
  });
});
