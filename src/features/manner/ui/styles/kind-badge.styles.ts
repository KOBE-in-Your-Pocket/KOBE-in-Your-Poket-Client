import { type SymbolViewProps } from 'expo-symbols';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

import type { MannerKind } from '../../domain/manner-item';

/** バッジの配色一式（背景・枠線・前景=文字/アイコン）。 */
type KindBadgeColorSet = {
  background: string;
  border: string;
  foreground: string;
};

/**
 * 分類ごとのバッジ配色。
 * ルールは塗りつぶしの警告レッドで強く目立たせ、マナーは控えめな青のアウトラインに留める。
 */
export const KIND_BADGE_COLORS: Record<MannerKind, KindBadgeColorSet> = {
  manner: {
    background: '#EAF2FF',
    border: '#B9D4FF',
    foreground: '#1D5BBF',
  },
  rule: {
    background: '#D92D20',
    border: '#D92D20',
    foreground: '#FFFFFF',
  },
};

/** 分類ごとのアイコン。ルールは注意喚起の警告三角、マナーは「お願い」を表す手のアイコン。 */
export const KIND_BADGE_ICONS: Record<MannerKind, SymbolViewProps['name']> = {
  manner: { ios: 'hand.raised.fill', android: 'front_hand', web: 'front_hand' },
  rule: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
};

export const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
