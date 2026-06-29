import { StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

/** 濃色カード上の文字・アイコン色（白固定）。 */
export const CARD_FOREGROUND = '#FFFFFF';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    borderRadius: 16,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 28,
    height: 28,
  },
  label: {
    marginTop: Spacing.three,
  },
});
