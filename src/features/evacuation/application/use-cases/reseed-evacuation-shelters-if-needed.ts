import type { SupportedLanguage } from '@/shared/lib/i18n';

import type { EvacuationShelter } from '../../domain/evacuation-shelter';
import type { EvacuationShelterRepository } from '../../domain/evacuation-shelter-repository';

export type ReseedEvacuationSheltersDeps = {
  repository: EvacuationShelterRepository;
  fetchShelters: (language: SupportedLanguage) => Promise<EvacuationShelter[]>;
  language: SupportedLanguage;
  getLastSeededLanguage: () => Promise<SupportedLanguage | null>;
  setLastSeededLanguage: (language: SupportedLanguage) => Promise<void>;
};

/**
 * 必要なときだけ避難所データを取得し直して SQLite に再投入する。
 *
 * テーブルが空（初回起動）、または最後にシードした表示言語が現在の言語と異なる
 * （表示言語の切り替え、もしくは AsyncStorage と SQLite の記録のズレ）場合に再フェッチする。
 */
export async function reseedEvacuationSheltersIfNeeded(
  deps: ReseedEvacuationSheltersDeps,
): Promise<boolean> {
  const [lastLanguage, existing] = await Promise.all([
    deps.getLastSeededLanguage(),
    deps.repository.findAll(),
  ]);

  if (lastLanguage === deps.language && existing.length > 0) {
    return false;
  }

  const shelters = await deps.fetchShelters(deps.language);
  await deps.repository.replaceAll(shelters);
  await deps.setLastSeededLanguage(deps.language);
  return true;
}
