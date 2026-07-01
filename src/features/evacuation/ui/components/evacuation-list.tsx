import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEvacuationShelters } from '../../application/use-evacuation-shelters';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';

import { styles } from '../styles/evacuation-list.styles';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

function ShelterListItem({ shelter }: { shelter: EvacuationShelter }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.card}>
      <View style={styles.typeBadge}>
        <ThemedText style={styles.typeText}>{t(`evacuation.list.type.${shelter.type}`)}</ThemedText>
      </View>

      <ThemedText type="smallBold" style={styles.name}>
        {shelter.name}
      </ThemedText>

      <View style={styles.addressRow}>
        <SymbolView
          tintColor={theme.textSecondary}
          name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
          size={14}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.address}>
          {shelter.address}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

function ListHeader() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
      <ThemedText type="subtitle" style={styles.title}>
        {t('evacuation.list.title')}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('evacuation.list.subtitle')}
      </ThemedText>
    </View>
  );
}

/**
 * 避難所一覧を表示するコンポーネント。
 *
 * application 層の `useEvacuationShelters()` 経由でデータを取得し、各避難所の
 * 名称・住所・種類を含むカード一覧を表示する。ローディング・エラー・空状態を扱う。
 */
export function EvacuationList() {
  const { t } = useTranslation();
  const { data: shelters, isPending, isError } = useEvacuationShelters();

  if (isPending) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{t('evacuation.list.loadError')}</ThemedText>
      </ThemedView>
    );
  }

  if (shelters.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{t('evacuation.list.empty')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={shelters}
      keyExtractor={(shelter) => shelter.id}
      renderItem={({ item }) => <ShelterListItem shelter={item} />}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
    />
  );
}
