import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { useSpotReviews } from '../../application/use-spot-reviews';

import { EMPTY_STAR_COLOR, RATING_STAR_COLOR, styles } from '../../ui/styles/review-list.styles';

import type { Review } from '../../domain/review';

import { ThemedText, ThemedView } from '@/shared/ui';

const MAX_RATING = 5;

function formatPostedAt(postedAt: string, language: string): string {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(postedAt));
}

function ReviewStars({ value }: { value: number }) {
  const filled = Math.round(value);

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <SymbolView
          key={index}
          tintColor={index < filled ? RATING_STAR_COLOR : EMPTY_STAR_COLOR}
          name={{ ios: 'star.fill', android: 'star', web: 'star' }}
          size={14}
        />
      ))}
    </View>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const { i18n } = useTranslation();

  return (
    <ThemedView type="backgroundElement" style={styles.item}>
      <View style={styles.itemHeader}>
        <Image source={{ uri: review.author.iconUrl }} style={styles.avatar} contentFit="cover" />
        <View style={styles.authorMeta}>
          <ThemedText type="smallBold">{review.author.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatPostedAt(review.postedAt, i18n.language)}
          </ThemedText>
        </View>
        <ReviewStars value={review.rating.value} />
      </View>

      <ThemedText themeColor="textSecondary" style={styles.comment}>
        {review.comment}
      </ThemedText>
    </ThemedView>
  );
}

/**
 * 観光スポットに投稿されたレビュー一覧を表示するコンポーネント。
 *
 * application 層の `useSpotReviews()` でデータを取得し、星評価・コメント本文・
 * 投稿者名・投稿者アイコン・投稿日時を表示する。
 */
export function ReviewList({ spotId }: { spotId: string }) {
  const { t } = useTranslation();
  const { data: reviews, isPending, isError } = useSpotReviews(spotId);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('tourism.reviewList.heading')}
      </ThemedText>

      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <ThemedText themeColor="textSecondary">{t('tourism.reviewList.loadError')}</ThemedText>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.centered}>
          <ThemedText themeColor="textSecondary">{t('tourism.reviewList.empty')}</ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </View>
      )}
    </View>
  );
}
