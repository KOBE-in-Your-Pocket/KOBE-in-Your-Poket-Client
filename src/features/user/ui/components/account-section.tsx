import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui';

import { useSignOut } from '../../application/use-sign-out';
import { useCurrentUser } from '../../application/use-current-user';
import { SignInModal } from './sign-in-modal';

/**
 * 設定画面のアカウント欄。
 * 未ログイン時はサインインモーダル（Google / メール + パスワード）を開くボタン、
 * ログイン中はユーザー名とログアウトボタンを表示する。
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
          <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="default">{currentUser.name}</ThemedText>
          </View>
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
});
