import type { EvacuationShelter } from '../../domain/evacuation-shelter';
import type { EvacuationShelterRepository } from '../../domain/evacuation-shelter-repository';
import { getEvacuationDatabase } from '../../infrastructure/db/client';
import { createSqliteEvacuationShelterRepository } from '../../infrastructure/db/sqlite-evacuation-shelter-repository';

import { bootstrapEvacuationDatabase } from './bootstrap-evacuation-database';

async function withEvacuationShelterRepository(): Promise<EvacuationShelterRepository> {
  await bootstrapEvacuationDatabase();
  return createSqliteEvacuationShelterRepository(getEvacuationDatabase());
}

export async function getEvacuationSheltersFromLocalDb(): Promise<EvacuationShelter[]> {
  const repository = await withEvacuationShelterRepository();
  return repository.findAll();
}

export async function getEvacuationShelterByIdFromLocalDb(
  id: string,
): Promise<EvacuationShelter | null> {
  const repository = await withEvacuationShelterRepository();
  return repository.findById(id);
}
