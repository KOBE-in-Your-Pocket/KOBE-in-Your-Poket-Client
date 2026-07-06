import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';

import { useTheme } from '@/shared/lib/theme';

import type { MannerItem } from '../../domain/manner-item';

type SymbolName = {
  ios: SFSymbol;
  android: AndroidSymbol;
  web: AndroidSymbol;
};

/** MannerItem.icon（識別キー）→ 実際のピクトグラム名のマッピング。 */
const ICON_MAP: Record<string, SymbolName> = {
  'no-eating-while-walking': { ios: 'fork.knife.circle', android: 'no_food', web: 'no_food' },
  'put-trash-in-bin': { ios: 'trash.circle', android: 'delete', web: 'delete' },
  'no-trespassing': { ios: 'nosign', android: 'block', web: 'block' },
  'handle-products-with-care': { ios: 'hand.raised', android: 'pan_tool', web: 'pan_tool' },
  'do-not-obstruct-pedestrians': {
    ios: 'figure.walk',
    android: 'directions_walk',
    web: 'directions_walk',
  },
  'no-smoking-while-walking': {
    ios: 'smoke',
    android: 'smoke_free',
    web: 'smoke_free',
  },
  'hold-your-suitcase': { ios: 'bag', android: 'work', web: 'work' },
  'backpack-on-front': { ios: 'backpack', android: 'backpack', web: 'backpack' },
  'show-consideration': { ios: 'heart', android: 'favorite', web: 'favorite' },
  'no-loud-conversation': {
    ios: 'speaker.slash',
    android: 'volume_off',
    web: 'volume_off',
  },
  'no-phone-calls': { ios: 'phone.down', android: 'phone_disabled', web: 'phone_disabled' },
};

const DEFAULT_ICON: SymbolName = { ios: 'info.circle', android: 'info', web: 'info' };

/** MannerItem 用のピクトグラムアイコン。未知の icon キーはデフォルトの info アイコンにフォールバックする。 */
export function MannerIcon({ icon, size = 22 }: { icon: MannerItem['icon']; size?: number }) {
  const theme = useTheme();
  const name = ICON_MAP[icon] ?? DEFAULT_ICON;

  return <SymbolView tintColor={theme.text} name={name} size={size} />;
}
