import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { useSubmitReview } from '../../application/use-submit-review';

import { ACTIVE_STAR_COLOR, INACTIVE_STAR_COLOR, styles } from '../styles/review-form.styles';

import { useCurrentUser } from '@/features/user/application/use-current-user';
import { useTheme } from '@/shared/lib/theme';
import { ThemedText, ThemedView } from '@/shared/ui';

const MAX_RATING = 5;

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: MAX_RATING }, (_, i) => (
        <Pressable
          key={i}
          style={styles.starButton}
          onPress={() => onChange(i + 1)}
          accessibilityRole="button"
          accessibilityLabel={t('tourism.reviewForm.starLabel', { count: i + 1 })}
        >
          <SymbolView
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            tintColor={i < value ? ACTIVE_STAR_COLOR : INACTIVE_STAR_COLOR}
            size={28}
          />
        </Pressable>
      ))}
    </View>
  );
}

export function ReviewForm({ spotId }: { spotId: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const submit = useSubmitReview(spotId);
  const currentUser = useCurrentUser();

  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // 現在ユーザーが変わったら（ログアウト／別ユーザーへの切替）書きかけの下書きを破棄する。
  // 前のユーザーの入力を次のユーザーへ持ち越さないため。
  // 副作用ではなくレンダー中の「変化に伴う state 調整」で行う（React 推奨）。
  const currentUserId = currentUser?.name ?? null;
  const [draftOwnerId, setDraftOwnerId] = useState(currentUserId);
  if (draftOwnerId !== currentUserId) {
    setDraftOwnerId(currentUserId);
    setExpanded(false);
    setRating(0);
    setComment('');
  }

  function handleSubmit() {
    if (rating === 0 || comment.trim() === '') return;
    submit({ rating: { value: rating }, comment: comment.trim() });
    setRating(0);
    setComment('');
    setExpanded(false);
  }

  function handleCancel() {
    setRating(0);
    setComment('');
    setExpanded(false);
  }

  // 未ログイン時はレビュー投稿できないためフォームを表示しない。
  // ログイン導線の表示は別要件で対応する。
  if (!currentUser) {
    return null;
  }

  if (!expanded) {
    return (
      <Pressable
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}
        onPress={() => setExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel={t('tourism.reviewForm.placeholder')}
      >
        <Image
          source={{ uri: currentUser.iconUrl }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
          contentFit="cover"
        />
        <ThemedText themeColor="textSecondary" style={styles.triggerText}>
          {t('tourism.reviewForm.placeholder')}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.form}>
      <StarInput value={rating} onChange={setRating} />

      <TextInput
        style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
        placeholder={t('tourism.reviewForm.commentPlaceholder')}
        placeholderTextColor={theme.textSecondary}
        value={comment}
        onChangeText={setComment}
        multiline
        autoFocus
      />

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.backgroundSelected }]}
          onPress={handleCancel}
          accessibilityRole="button"
        >
          <ThemedText type="smallBold">{t('tourism.reviewForm.cancel')}</ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: rating > 0 && comment.trim() ? '#D45B45' : theme.backgroundSelected,
            },
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || comment.trim() === ''}
          accessibilityRole="button"
        >
          <ThemedText
            type="smallBold"
            style={{ color: rating > 0 && comment.trim() ? '#FFFFFF' : theme.textSecondary }}
          >
            {t('tourism.reviewForm.submit')}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}
