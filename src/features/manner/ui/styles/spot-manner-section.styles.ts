import { StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

import { KIND_BADGE_COLORS } from './kind-badge.styles';

/** ルール強調のアクセント色（枠線・タイトル）。KindBadge のルール色と統一する。 */
const RULE_ACCENT_COLOR = KIND_BADGE_COLORS.rule.background;

/** ルールカードの背景。一覧より控えめな透明度で観光詳細内に馴染ませる。 */
const RULE_CARD_BACKGROUND = 'rgba(217, 45, 32, 0.06)';

export const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  itemList: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  ruleCard: {
    backgroundColor: RULE_CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: RULE_ACCENT_COLOR,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  ruleItemTitle: {
    color: RULE_ACCENT_COLOR,
  },
  itemDescription: {
    lineHeight: 18,
  },
});
