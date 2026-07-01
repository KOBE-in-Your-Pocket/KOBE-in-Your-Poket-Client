import { Platform, StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

export const CATEGORY_COLOR = '#3A6EA5';
export const ACCESSIBLE_COLOR = '#2E8B57';

export const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  card: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  imageWrapper: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    backgroundColor: CATEGORY_COLOR,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    color: CATEGORY_COLOR,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nearestBadge: {
    backgroundColor: ACCESSIBLE_COLOR,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  nearestBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  address: {
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  accessibilityText: {
    color: ACCESSIBLE_COLOR,
    fontWeight: '600',
  },
});
