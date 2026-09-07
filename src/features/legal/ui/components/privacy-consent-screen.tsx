import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { privacyPolicyUrl } from '../../domain/privacy-policy';

import { MaxContentWidth, Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

/** プライマリアクションの配色（サインインモーダルのアクセントカラーに合わせる）。 */
const ACCENT_COLOR = '#C67B4A';

export type PrivacyConsentScreenProps = {
  /** 同意ボタンの押下。保存に失敗した場合は reject する。 */
  onAccept: () => Promise<void>;
};

/**
 * 初回起動時に表示する同意画面。
 *
 * 同意するまでアプリ本体へ進めないブロッキング画面のため、閉じる導線は持たない。
 */
export function PrivacyConsentScreen({ onAccept }: PrivacyConsentScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const [isSaving, setIsSaving] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const openPolicy = async () => {
    await openBrowserAsync(privacyPolicyUrl(i18n.language), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  const accept = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setHasFailed(false);
    try {
      await onAccept();
    } catch {
      setHasFailed(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">{t('common.appName')}</ThemedText>
          <ThemedText type="subtitle">{t('legal.consent.title')}</ThemedText>
          <ThemedText>{t('legal.consent.description')}</ThemedText>

          <Pressable
            accessibilityRole="link"
            onPress={() => {
              void openPolicy();
            }}
            style={[styles.policyLink, { backgroundColor: theme.backgroundElement }]}
          >
            <ThemedText style={styles.policyLinkLabel}>{t('legal.consent.readPolicy')}</ThemedText>
          </Pressable>

          {hasFailed ? (
            <ThemedText style={styles.error}>{t('legal.consent.saveError')}</ThemedText>
          ) : null}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving }}
          disabled={isSaving}
          onPress={() => {
            void accept();
          }}
          style={[styles.acceptButton, isSaving && styles.acceptButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.acceptLabel}>{t('legal.consent.accept')}</ThemedText>
          )}
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
    paddingBottom: Spacing.four,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  policyLink: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  policyLinkLabel: {
    color: ACCENT_COLOR,
  },
  error: {
    color: '#D64545',
  },
  acceptButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
