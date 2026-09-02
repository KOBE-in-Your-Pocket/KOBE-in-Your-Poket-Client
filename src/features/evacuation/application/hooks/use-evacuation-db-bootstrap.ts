import { useEffect } from 'react';

import { useUiStore } from '@/shared/store';

import { bootstrapEvacuationDatabase } from '../use-cases/bootstrap-evacuation-database';

/**
 * `AppProviders` から呼ばれるため `<I18nextProvider>` の外側にあり、`useTranslation`
 * は使えない。`useLanguageBootstrap` と同様 `useUiStore` から言語を読む。
 * 表示言語が変わるたびに再実行し、避難所データの再シードをトリガーする。
 */
export function useEvacuationDbBootstrap(): void {
  const language = useUiStore((state) => state.language);

  useEffect(() => {
    void bootstrapEvacuationDatabase(language).catch((error: unknown) => {
      console.error('[evacuation] Failed to bootstrap local database:', error);
    });
  }, [language]);
}
