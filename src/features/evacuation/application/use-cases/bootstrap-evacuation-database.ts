import type { SupportedLanguage } from '@/shared/lib/i18n';

import { fetchEvacuationShelters } from '../../infrastructure/api/shelter-api';
import { getEvacuationDatabase } from '../../infrastructure/db/client';
import { runEvacuationMigrations } from '../../infrastructure/db/run-migrations';
import { createSqliteEvacuationShelterRepository } from '../../infrastructure/db/sqlite-evacuation-shelter-repository';
import {
  getLastSeededShelterLanguage,
  setLastSeededShelterLanguage,
} from '../../infrastructure/storage/shelter-language-storage';

import { reseedEvacuationSheltersIfNeeded } from './reseed-evacuation-shelters-if-needed';

let bootstrapPromise: Promise<void> | null = null;
let bootstrapLanguage: SupportedLanguage | null = null;

async function doBootstrapEvacuationDatabase(language: SupportedLanguage): Promise<void> {
  const db = getEvacuationDatabase();
  await runEvacuationMigrations(db);

  const repository = createSqliteEvacuationShelterRepository(db);
  await reseedEvacuationSheltersIfNeeded({
    repository,
    fetchShelters: fetchEvacuationShelters,
    language,
    getLastSeededLanguage: getLastSeededShelterLanguage,
    setLastSeededLanguage: setLastSeededShelterLanguage,
  });
}

/**
 * 避難所ローカル DB を bootstrap する。
 *
 * 同じ言語での呼び出しは進行中/完了済みの Promise を共有する。異なる言語での
 * 呼び出しが来た場合は、並行実行による SQLite と AsyncStorage の書き込み順序の
 * 不整合（#487）を避けるため、現在の実行の後に直列で繋いで実行する。
 */
export function bootstrapEvacuationDatabase(language: SupportedLanguage): Promise<void> {
  if (bootstrapPromise && bootstrapLanguage === language) {
    return bootstrapPromise;
  }

  const previous = bootstrapPromise ?? Promise.resolve();
  bootstrapLanguage = language;
  bootstrapPromise = previous
    .catch(() => undefined)
    .then(() => doBootstrapEvacuationDatabase(language))
    .catch((error: unknown) => {
      bootstrapPromise = null;
      bootstrapLanguage = null;
      throw error;
    });
  return bootstrapPromise;
}

export function resetEvacuationDatabaseBootstrapForTests(): void {
  bootstrapPromise = null;
  bootstrapLanguage = null;
}
