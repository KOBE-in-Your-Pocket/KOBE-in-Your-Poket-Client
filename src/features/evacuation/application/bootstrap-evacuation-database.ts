import { fetchEvacuationShelters } from '../infrastructure/api/mock-shelters';
import { getEvacuationDatabase } from '../infrastructure/db/client';
import { runEvacuationMigrations } from '../infrastructure/db/run-migrations';
import { createSqliteEvacuationShelterRepository } from '../infrastructure/db/sqlite-evacuation-shelter-repository';

import { seedEvacuationSheltersIfEmpty } from './seed-evacuation-shelters-if-empty';

let bootstrapPromise: Promise<void> | null = null;

async function doBootstrapEvacuationDatabase(): Promise<void> {
  const db = getEvacuationDatabase();
  await runEvacuationMigrations(db);

  const repository = createSqliteEvacuationShelterRepository(db);
  await seedEvacuationSheltersIfEmpty({
    repository,
    fetchShelters: fetchEvacuationShelters,
  });
}

export function bootstrapEvacuationDatabase(): Promise<void> {
  bootstrapPromise ??= doBootstrapEvacuationDatabase();
  return bootstrapPromise;
}

export function resetEvacuationDatabaseBootstrapForTests(): void {
  bootstrapPromise = null;
}
