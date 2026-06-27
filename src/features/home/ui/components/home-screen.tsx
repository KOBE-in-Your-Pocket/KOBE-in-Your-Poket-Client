import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

type HomeShortcut = {
  labelKey: string;
  href: Href;
};

/** ホームから各機能への暫定導線。掲載コンテンツ確定までのプレースホルダー。 */
const HOME_SHORTCUTS: HomeShortcut[] = [
  { labelKey: 'home.shortcuts.tourism', href: '/(tabs)/tourism' },
  { labelKey: 'home.shortcuts.map', href: '/(tabs)/map' },
  { labelKey: 'home.shortcuts.manners', href: '/(tabs)/manners' },
  { labelKey: 'home.shortcuts.settings', href: '/(tabs)/settings' },
];

export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('home.title')}</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {t('home.subtitle')}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            {t('home.placeholderNote')}
          </ThemedText>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {t('home.shortcutsTitle')}
          </ThemedText>

          {HOME_SHORTCUTS.map((shortcut) => (
            <Pressable
              key={shortcut.labelKey}
              accessibilityRole="button"
              onPress={() => router.navigate(shortcut.href)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.cardPressed,
              ]}
            >
              <ThemedText type="default">{t(shortcut.labelKey)}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
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
  },
  content: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  note: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    marginTop: Spacing.three,
  },
  card: {
    borderRadius: 12,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  cardPressed: {
    opacity: 0.7,
  },
});
