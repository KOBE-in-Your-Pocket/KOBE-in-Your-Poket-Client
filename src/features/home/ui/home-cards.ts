import type { Href } from 'expo-router';

type HomeCardDef = {
  labelKey: string;
  href: Href;
  /** カード背景色（home 専用ローカルパレット・白文字前提）。theme には依存しない。 */
  color: string;
  /** SymbolView 用のプラットフォーム別シンボル名（tab-bar と同形式）。 */
  symbol: { ios: string; android: string; web: string };
};

/**
 * ホームの Quick Access カード定義（観光 / 地図 / マナー / 避難所）。
 * 各カードは実ルートへ遷移する。色は 4 枚を同一彩度・明度で揃えた home 専用パレット
 * （珊瑚 / 青 / 緑 / 紫。白文字が読める明度に調整）。
 * `as const satisfies` でシンボル名のリテラル型を保持し SymbolView に渡せるようにする。
 */
export const HOME_CARDS = [
  {
    labelKey: 'home.shortcuts.tourism',
    href: '/(tabs)/tourism',
    color: '#D45B45',
    symbol: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  },
  {
    labelKey: 'home.shortcuts.map',
    href: '/(tabs)/map',
    color: '#3A6EA5',
    symbol: { ios: 'map', android: 'map', web: 'map' },
  },
  {
    labelKey: 'home.shortcuts.manners',
    href: '/(tabs)/manners',
    color: '#2E8B57',
    symbol: { ios: 'book', android: 'menu_book', web: 'menu_book' },
  },
  {
    labelKey: 'home.shortcuts.evacuation',
    href: '/(tabs)/evacuation',
    color: '#6E54AE',
    symbol: { ios: 'shield.fill', android: 'shield', web: 'shield' },
  },
] as const satisfies readonly HomeCardDef[];

export type HomeCard = (typeof HOME_CARDS)[number];
