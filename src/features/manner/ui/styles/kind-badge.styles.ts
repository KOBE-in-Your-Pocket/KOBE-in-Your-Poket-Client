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

/** ルール強調のアクセント色（枠線・タイトル）。カード系 UI でもこの値を参照する。 */
export const RULE_ACCENT_COLOR = KIND_BADGE_COLORS.rule.background;

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * ルールカードの半透明背景。不透明色ではなく alpha を使い、ライト/ダーク両テーマで馴染ませる。
 * {@link RULE_ACCENT_COLOR} から導出するため、バッジ配色変更時も追従する。
 */
export const RULE_CARD_BACKGROUND = hexToRgba(RULE_ACCENT_COLOR, 0.08);

/** 観光詳細など埋め込みコンテキスト向け。一覧より控えめな透明度。 */
export const RULE_CARD_BACKGROUND_SUBTLE = hexToRgba(RULE_ACCENT_COLOR, 0.06);

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
