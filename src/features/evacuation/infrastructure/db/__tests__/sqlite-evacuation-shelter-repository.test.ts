import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

import type { EvacuationShelter } from '../../../domain/evacuation-shelter';

import * as schema from '../schema';
import { createSqliteEvacuationShelterRepository } from '../sqlite-evacuation-shelter-repository';

const sampleShelters: EvacuationShelter[] = [
  {
    id: 'shelter-1',
    name: '避難所A',
    address: '住所A',
    coordinates: { latitude: 34.69, longitude: 135.19 },
    type: 'emergency',
    facilityCategory: 'park',
    media: { imageUrl: 'https://example.com/a.jpg' },
    capacity: 100,
    accessible: true,
  },
  {
    id: 'shelter-2',
    name: '避難所B',
    address: '住所B',
    coordinates: { latitude: 34.67, longitude: 135.16 },
    type: 'designated',
    facilityCategory: 'school',
    media: { imageUrl: 'https://example.com/b.jpg' },
    accessible: false,
  },
];

function createTestRepository() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.resolve(__dirname, '../../../../../../drizzle') });

  return createSqliteEvacuationShelterRepository(
    db as unknown as import('../client').EvacuationDatabase,
  );
}

describe('SqliteEvacuationShelterRepository', () => {
  it('replaceAll で避難所を永続化し findAll で取得できる', async () => {
    const repository = createTestRepository();

    await repository.replaceAll(sampleShelters);

    await expect(repository.findAll()).resolves.toEqual(sampleShelters);
  });

  it('findById で単一の避難所を取得できる', async () => {
    const repository = createTestRepository();
    await repository.replaceAll(sampleShelters);

    await expect(repository.findById('shelter-2')).resolves.toEqual(sampleShelters[1]);
    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('replaceAll は既存データを置き換える', async () => {
    const repository = createTestRepository();
    await repository.replaceAll(sampleShelters);
    await repository.replaceAll([sampleShelters[0]]);

    await expect(repository.findAll()).resolves.toEqual([sampleShelters[0]]);
  });

  it('replaceAll([]) で全件削除できる', async () => {
    const repository = createTestRepository();
    await repository.replaceAll(sampleShelters);
    await repository.replaceAll([]);

    await expect(repository.findAll()).resolves.toEqual([]);
  });
});
