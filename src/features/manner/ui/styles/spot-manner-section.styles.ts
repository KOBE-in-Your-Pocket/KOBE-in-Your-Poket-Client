import { StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

import { RULE_ACCENT_COLOR, RULE_CARD_BACKGROUND_SUBTLE } from './kind-badge.styles';

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
    backgroundColor: RULE_CARD_BACKGROUND_SUBTLE,
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
