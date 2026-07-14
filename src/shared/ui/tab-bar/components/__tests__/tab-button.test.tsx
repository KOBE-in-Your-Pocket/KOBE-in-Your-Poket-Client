import '@testing-library/jest-native/extend-expect';

import { render, screen } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';

import { TabButton } from '../tab-button';

import { styles } from '../../styles/tab-button.styles';
import { TAB_BAR_COLORS, TAB_DEFS } from '../../tab-bar-config';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

// styles が参照する Spacing を最小モック（@/shared/config 経由の CSS 読み込みを避ける）。
jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
}));

// @/shared/ui バレルは Reanimated / react-native-maps 等を巻き込むため、
// ラベル表示に必要な ThemedText だけを style を通す軽量スタブへ差し替える。
jest.mock('@/shared/ui', () => ({
  ThemedText: ({ children, style }: { children?: ReactNode; style?: StyleProp<TextStyle> }) => (
    <MockText style={style}>{children}</MockText>
  ),
}));

jest.mock('expo-symbols', () => ({ SymbolView: () => null }));

const SYMBOL = TAB_DEFS[0].symbol;

describe('TabButton', () => {
  it('isFocused の真偽で tabLabelFocused と文字色が切り替わる', () => {
    const { rerender } = render(
      <TabButton isFocused symbol={SYMBOL}>
        ホーム
      </TabButton>,
    );

    // 現在タブ: tabLabelFocused（太字＋拡大）が適用され、アクティブ色になる。
    expect(screen.getByText('ホーム')).toHaveStyle({
      fontSize: styles.tabLabelFocused.fontSize,
      fontWeight: styles.tabLabelFocused.fontWeight,
      color: TAB_BAR_COLORS.active,
    });

    rerender(
      <TabButton isFocused={false} symbol={SYMBOL}>
        ホーム
      </TabButton>,
    );

    // 非アクティブ: tabLabelFocused は非適用（通常サイズ・weight）で、非アクティブ色になる。
    expect(screen.getByText('ホーム')).toHaveStyle({
      fontSize: styles.tabLabel.fontSize,
      fontWeight: styles.tabLabel.fontWeight,
      color: TAB_BAR_COLORS.inactive,
    });
  });
});
