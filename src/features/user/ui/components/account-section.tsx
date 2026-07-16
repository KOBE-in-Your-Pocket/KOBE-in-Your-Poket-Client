import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui';

import { useGoogleSignIn } from '../../application/use-google-sign-in';
import { useSignOut } from '../../application/use-sign-out';
import { useCurrentUser } from '../../application/use-current-user';

/**
 * 設定画面のアカウント欄。
 * 未ログイン時は公式 Google サインインボタン、ログイン中はユーザー名とログアウトボタンを表示する。
 */
export function AccountSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentUser = useCurrentUser();
  const signIn = useGoogleSignIn();
  const signOut = useSignOut();

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
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            disabled={signIn.isPending}
            onPress={() => signIn.mutate()}
            style={styles.googleButton}
          />
          {signIn.isError ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.signInError')}
            </ThemedText>
          ) : null}
        </View>
      )}
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
  googleButton: {
    width: '100%',
    height: 48,
  },
});
