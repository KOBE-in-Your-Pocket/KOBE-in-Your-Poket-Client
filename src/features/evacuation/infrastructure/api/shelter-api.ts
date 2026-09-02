import { apiFetch } from '@/shared/lib/api';
import type { SupportedLanguage } from '@/shared/lib/i18n';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';

/** GET /api/v1/evacuation/shelters のレスポンス封筒。meta は #486/#492 で利用予定のため型は最小限に留める。 */
type EvacuationSheltersResponse = {
  data: EvacuationShelter[];
  meta: unknown;
};

/**
 * 避難所一覧を取得する。
 *
 * バックエンド `GET /api/v1/evacuation/shelters` を `lang` クエリ付きで呼び出す。
 * レスポンスは `{ data, meta }` の封筒形だが、既存 seam
 * `fetchEvacuationShelters(language): Promise<EvacuationShelter[]>` は `data` だけを
 * 取り出して返す。フィールド・enum 値はクライアントの {@link EvacuationShelter} と
 * 一致しており変換は不要。
 */
export async function fetchEvacuationShelters(
  language: SupportedLanguage,
): Promise<EvacuationShelter[]> {
  const response = await apiFetch<EvacuationSheltersResponse>('/api/v1/evacuation/shelters', {
    query: { lang: language },
  });
  return response.data;
}
