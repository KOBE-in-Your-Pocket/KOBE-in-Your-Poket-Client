import { apiFetch } from '@/shared/lib/api';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';

/** GET /api/v1/evacuation/shelters のレスポンス封筒。meta は #486/#492 で利用予定のため型は最小限に留める。 */
type EvacuationSheltersResponse = {
  data: EvacuationShelter[];
  meta: unknown;
};

/**
 * 避難所一覧を取得する。
 *
 * バックエンド `GET /api/v1/evacuation/shelters` を呼び出す。レスポンスは
 * `{ data, meta }` の封筒形だが、`fetchEvacuationShelters(): Promise<EvacuationShelter[]>`
 * という既存 seam のシグネチャは変えず `data` だけを取り出して返す。
 * フィールド・enum 値はクライアントの {@link EvacuationShelter} と一致しており変換は不要。
 */
export async function fetchEvacuationShelters(): Promise<EvacuationShelter[]> {
  const response = await apiFetch<EvacuationSheltersResponse>('/api/v1/evacuation/shelters');
  return response.data;
}
