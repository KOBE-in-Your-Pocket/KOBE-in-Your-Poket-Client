import { PixelRatio, StyleSheet } from 'react-native';

import { BottomTabInset, Fonts, Spacing } from '@/shared/config';

/** マナー種別の分類色（KIND_BADGE_COLORS）とは無関係な、スポットリンク用の固定色。 */
export const RELATED_SPOT_LINK_COLOR = {
  background: '#EAF2FF',
  foreground: '#1D5BBF',
};

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
    gap: Spacing.two,
  },
  // 一覧画面・ホーム画面と同じ装飾タイトル（筆記体・中央揃え・fontSize 30 / lineHeight 40）。
  title: {
    fontFamily: Fonts.cursive,
    fontWeight: 'normal',
    fontSize: 30,
    lineHeight: 40,
    textAlign: 'center',
  },
  // タイトルを上下で挟む区切り線（一覧画面・ホーム画面と同一スタイル）。
  divider: {
    height: PixelRatio.roundToNearestPixel(1),
    alignSelf: 'stretch',
  },
  // カードは分類アクセント色の枠線＋薄い背景で強調する（色はコンポーネントで分類ごとに指定）。
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
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
  // タイトルは分類アクセント色で強調する（色はコンポーネントで指定）。
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemDescription: {
    lineHeight: 20,
  },
  relatedSpots: {
    gap: Spacing.half,
    marginTop: Spacing.half,
  },
  relatedSpotChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  relatedSpotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.four,
    backgroundColor: RELATED_SPOT_LINK_COLOR.background,
  },
  relatedSpotText: {
    color: RELATED_SPOT_LINK_COLOR.foreground,
    fontWeight: '600',
  },
});
