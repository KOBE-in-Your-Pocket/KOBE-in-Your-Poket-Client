import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSpotDetail } from '../../application/use-spot-detail';
import { useSpotReviews } from '../../application/use-spot-reviews';
import { useUpdateReview } from '../../application/use-update-review';

import type { Review } from '../../domain/review';
import type { Spot } from '../../domain/spot';

import type { ReviewEdit } from '../../store/use-review-store';

import { RATING_STAR_COLOR, styles } from '../styles/spot-detail.styles';

import { ReviewForm } from './review-form';
import { ReviewLanguageFilter, type ReviewLangFilter } from './review-language-filter';

import { Spacing } from '@/shared/config';
import { confirmOpenDirections } from '@/shared/lib/directions';
import { useCurrentLocation } from '@/shared/lib/geo';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';
import { useCurrentUser } from '@/features/user/application/use-current-user';

function BackButton({ label }: { label: string }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={[styles.backButton, { top: insets.top + Spacing.two }]}
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Spacing.two}
    >
      <SymbolView
        tintColor="#FFFFFF"
        name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
        size={20}
      />
    </Pressable>
  );
}

const MAX_STAR = 5;

function ReviewCard({
  review,
  isOwn,
  onUpdate,
}: {
  review: Review;
  isOwn: boolean;
  onUpdate: (changes: ReviewEdit) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating.value);
  const [editComment, setEditComment] = useState(review.comment);

  function handleSave() {
    if (editRating === 0 || editComment.trim() === '') return;
    onUpdate({ rating: { value: editRating }, comment: editComment.trim() });
    setEditing(false);
  }

  function handleCancel() {
    setEditRating(review.rating.value);
    setEditComment(review.comment);
    setEditing(false);
  }

  if (editing) {
    return (
      <ThemedView type="backgroundElement" style={styles.reviewCard}>
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          {Array.from({ length: MAX_STAR }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => setEditRating(i + 1)}
              accessibilityRole="button"
              accessibilityLabel={t('tourism.reviewForm.starLabel', { count: i + 1 })}
            >
              <SymbolView
                name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                tintColor={i < editRating ? '#F5A623' : '#D8D8D8'}
                size={24}
              />
            </Pressable>
          ))}
        </View>
        <TextInput
          style={[
            styles.reviewComment,
            {
              backgroundColor: theme.background,
              color: theme.text,
              padding: Spacing.two,
              borderRadius: 8,
              minHeight: 72,
              textAlignVertical: 'top',
            },
          ]}
          value={editComment}
          onChangeText={setEditComment}
          multiline
          autoFocus
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two }}>
          <Pressable
            style={{
              paddingVertical: Spacing.two,
              paddingHorizontal: Spacing.three,
              borderRadius: 8,
              backgroundColor: theme.backgroundSelected,
            }}
            onPress={handleCancel}
            accessibilityRole="button"
          >
            <ThemedText type="smallBold">{t('tourism.reviewForm.cancel')}</ThemedText>
          </Pressable>
          <Pressable
            style={{
              paddingVertical: Spacing.two,
              paddingHorizontal: Spacing.three,
              borderRadius: 8,
              backgroundColor:
                editRating > 0 && editComment.trim() ? '#D45B45' : theme.backgroundSelected,
            }}
            onPress={handleSave}
            disabled={editRating === 0 || editComment.trim() === ''}
            accessibilityRole="button"
          >
            <ThemedText
              type="smallBold"
              style={{
                color: editRating > 0 && editComment.trim() ? '#FFFFFF' : theme.textSecondary,
              }}
            >
              {t('tourism.reviewCard.save')}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.author.iconUrl }}
          style={styles.reviewAvatar}
          contentFit="cover"
        />
        <ThemedText type="smallBold" style={styles.reviewAuthor} numberOfLines={1}>
          {review.author.name}
        </ThemedText>
        <View style={styles.ratingRow}>
          <SymbolView
            tintColor={RATING_STAR_COLOR}
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            size={14}
          />
          <ThemedText type="smallBold">{review.rating.value.toFixed(1)}</ThemedText>
        </View>
        {isOwn && (
          <Pressable
            onPress={() => setEditing(true)}
            accessibilityRole="button"
            accessibilityLabel={t('tourism.reviewCard.edit')}
            hitSlop={Spacing.two}
          >
            <SymbolView
              name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
              tintColor={theme.textSecondary}
              size={16}
            />
          </Pressable>
        )}
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.reviewComment}>
        {review.comment}
      </ThemedText>
    </ThemedView>
  );
}

function SpotDetailContent({ spot }: { spot: Spot }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { coords } = useCurrentLocation();
  const { data: reviews, isPending: isReviewsPending } = useSpotReviews(spot.id);
  const [reviewLang, setReviewLang] = useState<ReviewLangFilter>('all');
  const currentUser = useCurrentUser();
  const updateReview = useUpdateReview(spot.id);

  const handleOpenDirections = useCallback(() => {
    confirmOpenDirections(t, spot.coordinates, { origin: coords });
  }, [spot.coordinates, coords, t]);

  const filteredReviews =
    reviewLang === 'all'
      ? (reviews ?? [])
      : (reviews ?? []).filter((r) => r.language === reviewLang);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.hero}>
        <Image source={{ uri: spot.media.imageUrl }} style={styles.heroImage} contentFit="cover" />
        <BackButton label={t('tourism.spotDetail.back')} />
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <ThemedText style={styles.category}>{spot.category.label}</ThemedText>
          {spot.rating ? (
            <View style={styles.ratingRow}>
              <SymbolView
                tintColor={RATING_STAR_COLOR}
                name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                size={14}
              />
              <ThemedText type="smallBold">{spot.rating.value.toFixed(1)}</ThemedText>
            </View>
          ) : null}
        </View>

        <ThemedText type="subtitle" style={styles.name}>
          {spot.name}
        </ThemedText>

        <View style={styles.hoursRow}>
          <SymbolView
            tintColor={theme.textSecondary}
            name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
            size={14}
          />
          <ThemedText type="small" themeColor="textSecondary">
            {spot.businessHours}
          </ThemedText>
        </View>

        <ThemedText themeColor="textSecondary" style={styles.description}>
          {spot.description}
        </ThemedText>

        <Pressable
          style={styles.routeButton}
          onPress={handleOpenDirections}
          accessibilityRole="button"
          accessibilityLabel={t('tourism.spotDetail.openDirectionsButton')}
        >
          <SymbolView
            tintColor="#FFFFFF"
            name={{
              ios: 'arrow.triangle.turn.up.right.diamond.fill',
              android: 'directions',
              web: 'directions',
            }}
            size={16}
          />
          <ThemedText style={styles.routeButtonText}>
            {t('tourism.spotDetail.openDirectionsButton')}
          </ThemedText>
        </Pressable>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {t('tourism.spotDetail.reviews')}
          </ThemedText>
          <ReviewForm spotId={spot.id} />
          <ReviewLanguageFilter value={reviewLang} onChange={setReviewLang} />
          {isReviewsPending ? (
            <ActivityIndicator />
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review, index) => (
              <ReviewCard
                key={`${review.author.name}-${review.postedAt}-${index}`}
                review={review}
                isOwn={review.author.name === currentUser.name}
                onUpdate={(changes) => updateReview(review.id, changes)}
              />
            ))
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              {t('tourism.spotDetail.noReviews')}
            </ThemedText>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * 観光スポット詳細を表示する画面コンポーネント。
 *
 * `spotId` を受け取り application 層の `useSpotDetail()` / `useSpotReviews()` 経由で
 * スポット詳細とレビューを取得する。ルート（app 層）からは ID を渡すだけで描画でき、
 * データ取得・状態管理はこの feature 内に閉じる。
 */
export function SpotDetailScreen({ spotId }: { spotId: string }) {
  const { t } = useTranslation();
  const { data: spot, isPending, isError } = useSpotDetail(spotId);

  return (
    <ThemedView style={styles.container}>
      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : isError || !spot ? (
        <View style={styles.centered}>
          <ThemedText themeColor="textSecondary">{t('tourism.spotDetail.loadError')}</ThemedText>
        </View>
      ) : (
        <SpotDetailContent spot={spot} />
      )}
    </ThemedView>
  );
}
