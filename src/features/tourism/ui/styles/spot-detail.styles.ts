import { Platform, StyleSheet } from 'react-native';

import { Spacing } from '@/shared/config';

export const CATEGORY_COLOR = '#C67B4A';
export const RATING_STAR_COLOR = '#F5A623';
/** スポット一覧の「経路」ボタン（アプリ内マップへ遷移）。 */
export const ROUTE_BUTTON_COLOR = '#208AEF';
/** 詳細画面の「ナビを開始」ボタン（外部マップ起動）。一覧の経路ボタンと色で区別する。 */
export const NAV_BUTTON_COLOR = CATEGORY_COLOR;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  scrollContent: {
    paddingBottom: Spacing.five,
  },
  content: {
    paddingBottom: Spacing.five,
  },
  hero: {
    position: 'relative',
    height: 260,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: 260,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.three,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    color: CATEGORY_COLOR,
    fontSize: 13,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
  },
  description: {
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  routeButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: NAV_BUTTON_COLOR,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  sectionValue: {
    lineHeight: 22,
  },
  reviewCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewAuthor: {
    flex: 1,
  },
  reviewComment: {
    lineHeight: 20,
  },
});
