import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrentUser } from '../../application/use-current-user';

import { AvatarPicker } from './avatar-picker';

import { MaxContentWidth, Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

const SAVE_BUTTON_COLOR = '#D45B45';
const PREVIEW_AVATAR_SIZE = 96;

export function AccountEditScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentUser = useCurrentUser();

  const [name, setName] = useState(currentUser.name);
  const [iconUrl, setIconUrl] = useState(currentUser.iconUrl);

  const canSave = name.trim() !== '';

  // 保存処理は #404 で実装する。
  function handleSave() {}

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">{t('settings.account.title')}</ThemedText>

        <View style={styles.preview}>
          <Image
            source={{ uri: iconUrl }}
            style={styles.previewAvatar}
            contentFit="cover"
            accessibilityLabel={t('settings.account.iconLabel')}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {t('settings.account.iconLabel')}
          </ThemedText>
          <AvatarPicker selectedUrl={iconUrl} onSelect={setIconUrl} />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {t('settings.account.nameLabel')}
          </ThemedText>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
            placeholder={t('settings.account.namePlaceholder')}
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Pressable
          style={[
            styles.saveButton,
            { backgroundColor: canSave ? SAVE_BUTTON_COLOR : theme.backgroundSelected },
          ]}
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
        >
          <ThemedText type="smallBold" style={{ color: canSave ? '#FFFFFF' : theme.textSecondary }}>
            {t('settings.account.save')}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  preview: {
    alignItems: 'center',
  },
  previewAvatar: {
    width: PREVIEW_AVATAR_SIZE,
    height: PREVIEW_AVATAR_SIZE,
    borderRadius: PREVIEW_AVATAR_SIZE / 2,
  },
  field: {
    gap: Spacing.two,
  },
  textInput: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
});
