import { StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

/** 濃色カード上の文字・アイコン色（白固定）。 */
export const CARD_FOREGROUND = '#FFFFFF';

export const styles = StyleSheet.create({
  // 1列で縦積み。左右半分ずつに区切り、左=アイコン / 右=名称。
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    borderRadius: 16,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
  // 4分割のうち左1（アイコン）。
  iconHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 32,
    height: 32,
  },
  // 4分割のうち右3（名称）。
  labelHalf: {
    flex: 3,
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
