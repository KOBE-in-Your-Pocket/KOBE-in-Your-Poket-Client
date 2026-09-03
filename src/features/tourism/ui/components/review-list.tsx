import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { useSpotReviews } from '../../application/use-spot-reviews';

import { EMPTY_STAR_COLOR, RATING_STAR_COLOR, styles } from '../../ui/styles/review-list.styles';

import type { Review } from '../../domain/review';

import { ReviewForm } from './review-form';

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

export function ReviewList({ spotId }: { spotId: string }) {
  const { t } = useTranslation();
  const { data: reviews, isPending, isError } = useSpotReviews(spotId);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('tourism.reviewList.heading')}
      </ThemedText>

      <ReviewForm spotId={spotId} />

      {/*
        表示できるレビューがあれば、API 取得が失敗していても優先して一覧を出す。
        reviews は API 取得分とローカル投稿分を mergeReviews した結果のため、API 障害時でも
        ユーザー自身の投稿（useReviewStore 由来）が隠れないようにする。
        エラー表示は取得失敗かつ表示できるレビューが 0 件のときだけに限定する。
      */}
      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : reviews.length > 0 ? (
        <View style={styles.list}>
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <ThemedText themeColor="textSecondary">{t('tourism.reviewList.loadError')}</ThemedText>
        </View>
      ) : (
        <View style={styles.centered}>
          <ThemedText themeColor="textSecondary">{t('tourism.reviewList.empty')}</ThemedText>
        </View>
      )}
    </View>
  );
}
