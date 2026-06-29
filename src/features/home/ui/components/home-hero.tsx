import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { styles } from '../styles/home-hero.styles';

import { useTheme } from '@/shared/lib/theme';

/**
 * スカイライン画像が用意できるまでのプレースホルダーヒーロー。
 * 画像差し替え時はこのコンポーネントの中身だけを置き換える。
 */
export function HomeHero() {
  const theme = useTheme();

  return (
    <View style={[styles.hero, { backgroundColor: theme.backgroundElement }]}>
      <SymbolView
        name={{ ios: 'building.2.fill', android: 'location_city', web: 'location_city' }}
        tintColor={theme.textSecondary}
        size={48}
      />
    </View>
  );
}
