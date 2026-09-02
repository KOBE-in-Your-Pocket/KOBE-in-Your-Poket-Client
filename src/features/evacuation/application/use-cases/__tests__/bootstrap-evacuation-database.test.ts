import { getEvacuationDatabase } from '../../../infrastructure/db/client';
import { runEvacuationMigrations } from '../../../infrastructure/db/run-migrations';
import { createSqliteEvacuationShelterRepository } from '../../../infrastructure/db/sqlite-evacuation-shelter-repository';
import {
  bootstrapEvacuationDatabase,
  resetEvacuationDatabaseBootstrapForTests,
} from '../bootstrap-evacuation-database';
import { reseedEvacuationSheltersIfNeeded } from '../reseed-evacuation-shelters-if-needed';

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

jest.mock('../../../infrastructure/storage/shelter-language-storage', () => ({
  getLastSeededShelterLanguage: jest.fn(),
  setLastSeededShelterLanguage: jest.fn(),
}));

jest.mock('../reseed-evacuation-shelters-if-needed', () => ({
  reseedEvacuationSheltersIfNeeded: jest.fn(),
}));

const mockDb = {};
const mockRepository = {};

/** マイクロタスクのみで進む処理が predicate を満たすまで、少数回 tick を進める。 */
async function waitFor(predicate: () => boolean): Promise<void> {
  for (let i = 0; i < 20 && !predicate(); i++) {
    await Promise.resolve();
  }
}

describe('bootstrapEvacuationDatabase', () => {
  beforeEach(() => {
    resetEvacuationDatabaseBootstrapForTests();
    jest.clearAllMocks();

    jest.mocked(getEvacuationDatabase).mockReturnValue(mockDb as never);
    jest.mocked(createSqliteEvacuationShelterRepository).mockReturnValue(mockRepository as never);
    jest.mocked(runEvacuationMigrations).mockResolvedValue(undefined);
    jest.mocked(reseedEvacuationSheltersIfNeeded).mockResolvedValue(true);
  });

  it('失敗時は Promise キャッシュをクリアし、再呼び出しでリトライできる', async () => {
    jest
      .mocked(runEvacuationMigrations)
      .mockRejectedValueOnce(new Error('migration failed'))
      .mockResolvedValueOnce(undefined);

    await expect(bootstrapEvacuationDatabase('ja')).rejects.toThrow('migration failed');
    await expect(bootstrapEvacuationDatabase('ja')).resolves.toBeUndefined();

    expect(runEvacuationMigrations).toHaveBeenCalledTimes(2);
    expect(reseedEvacuationSheltersIfNeeded).toHaveBeenCalledTimes(1);
  });

  it('同じ言語での進行中の Promise を共有し、同時呼び出しで二重 bootstrap しない', async () => {
    let resolveMigration: (() => void) | undefined;
    jest.mocked(runEvacuationMigrations).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveMigration = resolve;
        }),
    );

    const first = bootstrapEvacuationDatabase('ja');
    const second = bootstrapEvacuationDatabase('ja');

    await waitFor(() => resolveMigration !== undefined);
    resolveMigration?.();
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);

    expect(runEvacuationMigrations).toHaveBeenCalledTimes(1);
    expect(reseedEvacuationSheltersIfNeeded).toHaveBeenCalledTimes(1);
    expect(reseedEvacuationSheltersIfNeeded).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'ja' }),
    );
  });

  it('別言語での呼び出しは進行中の bootstrap の完了を待ってから実行する（並行実行によるDB/AsyncStorageの不整合を防ぐ）', async () => {
    const events: string[] = [];
    let resolveJaReseed: (() => void) | undefined;

    jest.mocked(reseedEvacuationSheltersIfNeeded).mockImplementation((deps) => {
      events.push(`start:${deps.language}`);
      if (deps.language === 'ja') {
        return new Promise((resolve) => {
          resolveJaReseed = () => {
            events.push('resolve:ja');
            resolve(true);
          };
        });
      }
      return Promise.resolve(true);
    });

    const first = bootstrapEvacuationDatabase('ja');
    const second = bootstrapEvacuationDatabase('en');

    await waitFor(() => resolveJaReseed !== undefined);
    // 'ja' の reseed がまだ完了していない間は 'en' 側は開始されていないはず。
    expect(events).toEqual(['start:ja']);

    resolveJaReseed?.();
    await Promise.all([first, second]);

    expect(events).toEqual(['start:ja', 'resolve:ja', 'start:en']);
    expect(reseedEvacuationSheltersIfNeeded).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ language: 'ja' }),
    );
    expect(reseedEvacuationSheltersIfNeeded).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ language: 'en' }),
    );
  });
});
