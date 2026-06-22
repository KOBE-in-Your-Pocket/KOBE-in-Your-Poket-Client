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
  pressed: {
    opacity: 0.7,
  },
});
