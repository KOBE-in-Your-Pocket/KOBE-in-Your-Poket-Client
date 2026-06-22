/** タブバー本体の高さ（セーフエリア除く）。アイコン + ラベル + 余白。 */
export const TAB_BAR_CONTENT_HEIGHT = 68;

export const TAB_BAR_COLORS = {
  active: '#D85C4A',
  inactive: '#6B635B',
  activeBorder: '#F5CACA',
  background: '#FFFFFF',
} as const;

export type TabDefinition = {
  name: string;
  labelKey: string;
  href: `/(tabs)/${string}`;
  symbol: {
    ios: string;
    android: string;
    web: string;
  };
};

export const TAB_DEFS = [
  {
    name: 'map',
    labelKey: 'tabs.map',
    href: '/(tabs)/map',
    symbol: { ios: 'location.north.line', android: 'navigation', web: 'navigation' },
  },
  {
    name: 'tourism',
    labelKey: 'tabs.tourism',
    href: '/(tabs)/tourism',
    symbol: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  },
  {
    name: 'manners',
    labelKey: 'tabs.manner',
    href: '/(tabs)/manners',
    symbol: { ios: 'book', android: 'menu_book', web: 'menu_book' },
  },
  {
    name: 'settings',
    labelKey: 'tabs.settings',
    href: '/(tabs)/settings',
    symbol: { ios: 'gearshape', android: 'settings', web: 'settings' },
  },
] as const satisfies readonly TabDefinition[];
