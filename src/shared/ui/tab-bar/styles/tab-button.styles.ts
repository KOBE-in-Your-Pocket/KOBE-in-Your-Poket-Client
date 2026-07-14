import { StyleSheet } from 'react-native';

import { TAB_BAR_COLORS } from '../tab-bar-config';

import { Spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 64,
  },
  tabButtonInnerFocused: {
    borderColor: TAB_BAR_COLORS.activeBorder,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  // 現在タブのラベルを太字＋やや大きめで強調する（色・枠線に加えて文字でも現在地を示す）。
  tabLabelFocused: {
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
