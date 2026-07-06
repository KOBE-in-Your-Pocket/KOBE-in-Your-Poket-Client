import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { useManners } from '../hooks/use-manners';

import { styles } from '../styles/manner-list.styles';

import type { MannerItem } from '../../domain/manner-item';

import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

import { MannerIcon } from './manner-icon';

function MannerListItem({ manner }: { manner: MannerItem }) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundElement }]}>
        <MannerIcon icon={manner.icon} />
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.itemTitle}>{manner.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.itemDescription}>
          {manner.description}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

function ListHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <ThemedText type="subtitle" style={styles.title}>
        {t('manner.list.title')}
      </ThemedText>
    </View>
  );
}

/**
 * マナー項目一覧を表示するコンポーネント。
 *
 * application 層の `useManners()` 経由でデータを取得し、各項目のアイコン・タイトル・
 * 短い説明を含むカード一覧を表示する。詳細画面は持たず一覧のみで完結する。
 */
export function MannerList() {
  const { t } = useTranslation();
  const { data: manners, isPending, isError } = useManners();

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
        <ThemedText themeColor="textSecondary">{t('manner.list.loadError')}</ThemedText>
      </ThemedView>
    );
  }

  if (manners.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{t('manner.list.empty')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={manners}
      keyExtractor={(manner) => manner.id}
      renderItem={({ item }) => <MannerListItem manner={item} />}
      ListHeaderComponent={<ListHeader />}
      contentContainerStyle={styles.listContent}
    />
  );
}
