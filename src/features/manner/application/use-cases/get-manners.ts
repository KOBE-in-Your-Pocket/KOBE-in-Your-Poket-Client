import type { SupportedLanguage } from '@/shared/lib/i18n';

import type { MannerItem } from '../../domain/manner-item';
import { createMockMannerRepository } from '../../infrastructure/api/mock-manner-repository';

/**
 * 指定言語のマナー項目一覧を取得するユースケース。
 *
 * domain の {@link MannerRepository} 経由でデータを取得する。
 * 現状は mock 実装を利用し、実 API 導入後は composition 側の実装差し替えのみで対応する。
 */
export async function getManners(language: SupportedLanguage): Promise<MannerItem[]> {
  const repository = createMockMannerRepository();
  return repository.findAll(language);
}
