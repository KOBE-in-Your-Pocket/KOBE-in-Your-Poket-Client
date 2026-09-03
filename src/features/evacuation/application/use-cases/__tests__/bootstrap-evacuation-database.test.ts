import { getEvacuationDatabase } from '../../../infrastructure/db/client';
import { runEvacuationMigrations } from '../../../infrastructure/db/run-migrations';
import { createSqliteEvacuationShelterRepository } from '../../../infrastructure/db/sqlite-evacuation-shelter-repository';
import {
  bootstrapEvacuationDatabase,
  resetEvacuationDatabaseBootstrapForTests,
} from '../bootstrap-evacuation-database';
import { seedEvacuationSheltersIfEmpty } from '../seed-evacuation-shelters-if-empty';

jest.mock('../../../infrastructure/api/shelter-api', () => ({
  fetchEvacuationShelters: jest.fn(),
}));

jest.mock('../../../infrastructure/db/client', () => ({
  getEvacuationDatabase: jest.fn(),
}));

jest.mock('../../../infrastructure/db/run-migrations', () => ({
  runEvacuationMigrations: jest.fn(),
}));

jest.mock('../../../infrastructure/db/sqlite-evacuation-shelter-repository', () => ({
  createSqliteEvacuationShelterRepository: jest.fn(),
}));

jest.mock('../seed-evacuation-shelters-if-empty', () => ({
  seedEvacuationSheltersIfEmpty: jest.fn(),
}));

const mockDb = {};
const mockRepository = {};

describe('bootstrapEvacuationDatabase', () => {
  beforeEach(() => {
    resetEvacuationDatabaseBootstrapForTests();
    jest.clearAllMocks();

    jest.mocked(getEvacuationDatabase).mockReturnValue(mockDb as never);
    jest.mocked(createSqliteEvacuationShelterRepository).mockReturnValue(mockRepository as never);
    jest.mocked(seedEvacuationSheltersIfEmpty).mockResolvedValue(true);
  });

  it('失敗時は Promise キャッシュをクリアし、再呼び出しでリトライできる', async () => {
    jest
      .mocked(runEvacuationMigrations)
      .mockRejectedValueOnce(new Error('migration failed'))
      .mockResolvedValueOnce(undefined);

    await expect(bootstrapEvacuationDatabase()).rejects.toThrow('migration failed');
    await expect(bootstrapEvacuationDatabase()).resolves.toBeUndefined();

    expect(runEvacuationMigrations).toHaveBeenCalledTimes(2);
    expect(seedEvacuationSheltersIfEmpty).toHaveBeenCalledTimes(1);
  });

  it('進行中の Promise を共有し、同時呼び出しで二重 bootstrap しない', async () => {
    let resolveMigration: (() => void) | undefined;
    jest.mocked(runEvacuationMigrations).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveMigration = resolve;
        }),
    );

    const first = bootstrapEvacuationDatabase();
    const second = bootstrapEvacuationDatabase();

    resolveMigration?.();
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);

    expect(runEvacuationMigrations).toHaveBeenCalledTimes(1);
    expect(seedEvacuationSheltersIfEmpty).toHaveBeenCalledTimes(1);
  });
});
