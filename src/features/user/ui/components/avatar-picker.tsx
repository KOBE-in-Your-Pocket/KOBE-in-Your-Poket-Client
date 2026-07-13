import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';

// アイコンは当面プリセットからの選択制（画像アップロードはバックエンド整備後に検討）。
export const PRESET_AVATAR_URLS = [
  'https://i.pravatar.cc/150?img=68',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=25',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=56',
  'https://i.pravatar.cc/150?img=60',
] as const;

const AVATAR_SIZE = 56;

type AvatarPickerProps = {
  selectedUrl: string;
  onSelect: (url: string) => void;
};

export function AvatarPicker({ selectedUrl, onSelect }: AvatarPickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {PRESET_AVATAR_URLS.map((url, index) => {
        const selected = url === selectedUrl;
        return (
          <Pressable
            key={url}
            accessibilityRole="radio"
            accessibilityLabel={t('settings.account.avatarOption', { number: index + 1 })}
            accessibilityState={{ selected }}
            onPress={() => onSelect(url)}
            style={[styles.option, { borderColor: selected ? theme.text : 'transparent' }]}
          >
            <Image
              source={{ uri: url }}
              style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}
              contentFit="cover"
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    borderWidth: 2,
    borderRadius: (AVATAR_SIZE + Spacing.one * 2 + 4) / 2,
    padding: Spacing.one,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
});
