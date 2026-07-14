import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFilteredManners } from '../hooks/use-filtered-manners';

import { KIND_ACCENT_COLOR, KIND_CARD_BACKGROUND } from '../styles/kind-badge.styles';
import { RELATED_SPOT_LINK_COLOR, styles } from '../styles/manner-list.styles';

import type { MannerItem } from '../../domain/manner-item';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

import { KindBadge } from './kind-badge';
import { KindFilter } from './kind-filter';
import { MannerPictogram } from './manner-pictogram';
import { ScopeFilter } from './scope-filter';

/** manner 機能が tourism 機能に依存しないよう、Spot の形を直接importせずこの最小形で受け取る。 */
export type RelatedSpot = {
  id: string;
  name: string;
};

function RelatedSpots({ manner, spots }: { manner: MannerItem; spots: RelatedSpot[] | undefined }) {
  const { t } = useTranslation();
  const relatedSpots = spots?.filter((spot) => manner.relatedSpotIds.includes(spot.id)) ?? [];

  if (relatedSpots.length === 0) {
    return null;
  }

  return (
    <View style={styles.relatedSpots}>
      <ThemedText type="small" themeColor="textSecondary">
        {t('manner.list.relatedSpots')}
      </ThemedText>
      <View style={styles.relatedSpotChips}>
        {relatedSpots.map((spot) => (
          <Pressable
            key={spot.id}
            style={styles.relatedSpotChip}
            onPress={() => router.push({ pathname: '/tourism/[id]', params: { id: spot.id } })}
            accessibilityRole="link"
            accessibilityLabel={spot.name}
          >
            <SymbolView
              tintColor={RELATED_SPOT_LINK_COLOR.foreground}
              name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
              size={12}
            />
            <ThemedText type="small" style={styles.relatedSpotText}>
              {spot.name}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MannerListItem({
  manner,
  spots,
}: {
  manner: MannerItem;
  spots: RelatedSpot[] | undefined;
}) {
  const theme = useTheme();
  const accent = KIND_ACCENT_COLOR[manner.kind];

  return (
    <ThemedView
      style={[
        styles.card,
        { backgroundColor: KIND_CARD_BACKGROUND[manner.kind], borderColor: accent },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundElement }]}>
        <MannerPictogram manner={manner} size={40} />
      </View>

      <View style={styles.content}>
        <KindBadge kind={manner.kind} />
        <ThemedText style={[styles.itemTitle, { color: accent }]}>{manner.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.itemDescription}>
          {manner.description}
        </ThemedText>
        <RelatedSpots manner={manner} spots={spots} />
      </View>
    </ThemedView>
  );
}

function ListHeader() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
      <ThemedText type="subtitle" style={styles.title}>
        {t('manner.list.title')}
      </ThemedText>
      <KindFilter />
      <ScopeFilter />
    </View>
  );
}

/**
 * マナー項目一覧を表示するコンポーネント。
 *
 * application 層の `useFilteredManners()` 経由で選択中の種別・地域スコープに絞り込んだデータを
 * 取得し、各項目のアイコン・タイトル・短い説明を含むカード一覧を表示する。上部の
 * {@link KindFilter} と {@link ScopeFilter} でチップを選ぶと一覧が即座に更新される。
 * 詳細画面は持たず一覧のみで完結する。
 */
export function MannerList({ spots }: { spots?: RelatedSpot[] }) {
  const { t } = useTranslation();
  const { data: manners, isPending, isError } = useFilteredManners();

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

  // 絞り込み結果が空でもヘッダーの KindFilter / ScopeFilter は表示し続け、他の条件へ切り替えられるようにする。
  return (
    <FlatList
      data={manners}
      keyExtractor={(manner) => manner.id}
      renderItem={({ item }) => <MannerListItem manner={item} spots={spots} />}
      ListHeaderComponent={<ListHeader />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <ThemedText themeColor="textSecondary">{t('manner.list.empty')}</ThemedText>
        </View>
      }
      contentContainerStyle={styles.listContent}
    />
  );
}
