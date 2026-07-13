import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeCard } from './home-card';
import { HomeHero } from './home-hero';

import { HOME_CARDS } from '../home-cards';
import { styles } from '../styles/home-screen.styles';

import { ThemedText, ThemedView } from '@/shared/ui';

export function HomeScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {t('common.appName')}
          </ThemedText>

          <HomeHero />

          <View style={styles.grid}>
            {[0, 2].map((start) => (
              <View key={start} style={styles.row}>
                {HOME_CARDS.slice(start, start + 2).map((card) => (
                  <HomeCard key={card.labelKey} card={card} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
