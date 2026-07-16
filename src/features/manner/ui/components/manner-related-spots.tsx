import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { RELATED_SPOT_LINK_COLOR, styles } from '../styles/manner-related-spots.styles';

import type { MannerItem } from '../../domain/manner-item';

import { ThemedText } from '@/shared/ui';

/** manner 機能が tourism 機能に依存しないよう、Spot の形を直接importせずこの最小形で受け取る。 */
export type RelatedSpot = {
  id: string;
  name: string;
};

/**
 * マナー項目に紐づく観光スポットへのリンクチップ一覧。
 *
 * `manner.relatedSpotIds` に一致する `spots` だけを表示し、タップで観光詳細へ遷移する。
 * 該当が無い（または `spots` 未取得）の場合は何も描画しない。
 */
export function MannerRelatedSpots({
  manner,
  spots,
}: {
  manner: MannerItem;
  spots: RelatedSpot[] | undefined;
}) {
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
