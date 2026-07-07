import { StyleSheet } from 'react-native';

import { BottomTabInset, Spacing } from '@/shared/config';

import { RULE_ACCENT_COLOR, RULE_CARD_BACKGROUND } from './kind-badge.styles';

export const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  /** 絞り込み結果が 0 件のときにヘッダー下へ表示する空メッセージ。 */
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  header: {
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  /** ルール項目はマナーより目立たせるため、枠線＋薄い背景色で強調する。 */
  ruleCard: {
    backgroundColor: RULE_CARD_BACKGROUND,
    borderWidth: 1.5,
    borderColor: RULE_ACCENT_COLOR,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  /** ルール項目のタイトルはアクセント色でさらに強調する。 */
  ruleItemTitle: {
    color: RULE_ACCENT_COLOR,
  },
  itemDescription: {
    lineHeight: 20,
  },
});
