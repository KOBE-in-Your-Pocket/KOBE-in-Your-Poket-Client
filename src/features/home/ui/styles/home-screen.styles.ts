import { StyleSheet } from 'react-native';

import { BottomTabInset, Fonts, Spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  title: {
    // 筆記体・中央揃え・共有 title(48) より小さめ。
    fontFamily: Fonts.cursive,
    fontWeight: 'normal',
    fontSize: 30,
    lineHeight: 40,
    textAlign: 'center',
    // 内カメ（ノッチ/パンチホール）に被らないよう SafeArea 上端から余白を確保。
    marginTop: Spacing.one,
  },
  grid: {
    gap: Spacing.three,
  },
});
