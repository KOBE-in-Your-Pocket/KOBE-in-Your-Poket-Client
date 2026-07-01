import { Platform, StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Spacing.three,
    zIndex: 1,
  },
  track: {
    flexDirection: 'row',
    borderRadius: Spacing.five,
    padding: Spacing.half,
    gap: Spacing.half,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  segment: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    minWidth: 56,
    alignItems: 'center',
  },
});
