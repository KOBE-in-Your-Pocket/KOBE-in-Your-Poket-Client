import type { PublicUser } from '@/features/user';
import { apiFetch } from '@/shared/lib/api';
import type { SupportedLanguage } from '@/shared/lib/i18n';

import type { Review } from '../../domain/review';

/**
 * Backend が返すレビュー author。表示名のみを返し、id / iconUrl は返さない（#490）。
 * 将来 Backend が id / iconUrl を返すようになっても壊れないよう任意項目として受ける。
 */
type ReviewAuthorResponse = {
  name: string;
  id?: string | null;
  iconUrl?: string | null;
};

/** Backend `GET .../reviews` のレスポンス要素。author 以外は {@link Review} 型と互換。 */
type ReviewResponse = Omit<Review, 'author'> & {
  author: ReviewAuthorResponse;
};

/** author.id 未返却時のフォールバック。実ユーザー ID と衝突しない空文字とする。 */
const FALLBACK_AUTHOR_ID = '';
/** author.iconUrl 未返却時のフォールバック。空文字にすると UserAvatar がプレースホルダを表示する。 */
const FALLBACK_AUTHOR_ICON_URL = '';

/**
 * Backend レスポンス（author が name のみ）をドメインの {@link Review}（author は PublicUser）へ変換する。
 * id / iconUrl が欠けている場合はフォールバック値で補い、UI 側でプレースホルダ表示に委ねる。
 */
function toReview(dto: ReviewResponse): Review {
  return {
    ...dto,
    author: {
      id: dto.author.id ?? FALLBACK_AUTHOR_ID,
      name: dto.author.name,
      iconUrl: dto.author.iconUrl ?? FALLBACK_AUTHOR_ICON_URL,
    },
  };
}

/**
 * 指定スポットに投稿されたレビュー一覧を取得する。
 *
 * バックエンド `GET /api/v1/tourism/spots/:spotId/reviews` を呼び出し、指定言語で
 * 解決済みのレビュー一覧を返す。author は name のみ返るため {@link toReview} でドメイン型へ変換する。
 * 該当スポットにレビューが無ければ空配列が返る。
 */
export async function fetchReviews(spotId: string, language: SupportedLanguage): Promise<Review[]> {
  const response = await apiFetch<ReviewResponse[]>(
    `/api/v1/tourism/spots/${encodeURIComponent(spotId)}/reviews`,
    { query: { lang: language } },
  );

  return response.map(toReview);
}

/** 投稿するレビューの内容。 */
export type ReviewInput = {
  rating: { value: number };
  comment: string;
  language: SupportedLanguage;
};

/**
 * レビューを投稿する。
 *
 * バックエンド `POST /api/v1/tourism/spots/:spotId/reviews` を呼び出す（認証必須 / #506）。
 * backend はレスポンスの author に id を返さないが、投稿は自分のものなので
 * ログイン中のユーザーで補う（{@link fetchReviews} の空文字フォールバックとは違い、
 * 投稿直後の一覧で「自分のレビュー」として扱えるようにするため）。
 */
export async function postReview(
  spotId: string,
  input: ReviewInput,
  author: PublicUser,
): Promise<Review> {
  const response = await apiFetch<ReviewResponse>(
    `/api/v1/tourism/spots/${encodeURIComponent(spotId)}/reviews`,
    {
      method: 'POST',
      auth: true,
      body: {
        rating: input.rating.value,
        comment: input.comment,
        // backend は author.name を必須・iconUrl を任意で受け取る（未設定は null）。
        author: { name: author.name, iconUrl: author.iconUrl || null },
        language: input.language,
      },
    },
  );

  return {
    ...toReview(response),
    author: {
      id: author.id,
      name: response.author.name,
      iconUrl: response.author.iconUrl ?? author.iconUrl,
    },
  };
}
