import { DancingScript_600SemiBold } from '@expo-google-fonts/dancing-script';
import { useFonts } from 'expo-font';

import { CURSIVE_FONT_FAMILY } from '@/shared/config';

/**
 * 起動時にカスタムフォント（筆記体: Dancing Script）をロードする。
 * ロード完了までは端末標準フォントで表示され、完了後に自動で差し替わる。
 * ロードキーに `CURSIVE_FONT_FAMILY` を使うため、`Fonts.cursive` の family 名と常に一致する。
 */
export function useFontsBootstrap(): boolean {
  const [loaded] = useFonts({
    [CURSIVE_FONT_FAMILY]: DancingScript_600SemiBold,
  });

  return loaded;
}
