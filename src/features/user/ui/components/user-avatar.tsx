import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/lib/theme';

/** ユーザーアイコン。iconUrl 未設定時は人物シンボルのプレースホルダを表示する。 */
export function UserAvatar({ iconUrl, size }: { iconUrl: string; size: number }) {
  const theme = useTheme();
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (iconUrl === '') {
    return (
      <View style={[styles.placeholder, shape, { backgroundColor: theme.backgroundSelected }]}>
        <SymbolView
          name={{ ios: 'person.fill', android: 'person', web: 'person' }}
          tintColor={theme.textSecondary}
          size={size * 0.55}
        />
      </View>
    );
  }

  return <Image source={{ uri: iconUrl }} style={shape} contentFit="cover" />;
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
