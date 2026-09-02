import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui';

import { useSignOut } from '../../application/use-sign-out';
import { useCurrentUser } from '../../application/use-current-user';
import { SignInModal } from './sign-in-modal';
import { UserAvatar } from './user-avatar';

/**
 * 設定画面のアカウント欄。
 * 未ログイン時はサインインモーダル（Google / メール + パスワード）を開くボタン、
 * ログイン中はアカウント行（タップでアカウント編集画面へ遷移）とログアウトボタンを表示する。
 */
export function AccountSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentUser = useCurrentUser();
  const signOut = useSignOut();
  const [signInVisible, setSignInVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('settings.account')}
      </ThemedText>
      {currentUser ? (
        <View style={styles.list}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.editAccount')}
            onPress={() => router.push('/settings/account-edit')}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.userInfo}>
              <UserAvatar iconUrl={currentUser.iconUrl} size={32} />
              <ThemedText type="default" style={styles.userName} numberOfLines={1}>
                {currentUser.name}
              </ThemedText>
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              tintColor={theme.textSecondary}
              size={16}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={signOut.isPending}
            onPress={() => signOut.mutate()}
            style={[styles.row, { backgroundColor: theme.backgroundElement }]}
          >
            <ThemedText type="default" themeColor="textSecondary">
              {t('settings.signOut')}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSignInVisible(true)}
            style={[styles.row, { backgroundColor: theme.backgroundElement }]}
          >
            <ThemedText type="default">{t('settings.signIn')}</ThemedText>
          </Pressable>
        </View>
      )}
      <SignInModal visible={signInVisible} onClose={() => setSignInVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginRight: Spacing.two,
  },
  userName: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
