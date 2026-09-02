import { useAuthStore } from '../../store/use-auth-store';
import { performProfileUpdate } from '../use-update-profile';

const USER = { id: 'user-1', name: 'Google 太郎', iconUrl: '' };

describe('performProfileUpdate', () => {
  const updatePersistedUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    updatePersistedUser.mockResolvedValue(undefined);
    useAuthStore.setState({
      currentUser: USER,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('表示名（trim 済み）とアイコンをストアと永続化へ反映する', async () => {
    await performProfileUpdate(
      { name: '  新しい名前  ', iconUrl: 'https://i.pravatar.cc/150?img=5' },
      { persistedUserStore: { updatePersistedUser } },
    );

    const updated = {
      id: 'user-1',
      name: '新しい名前',
      iconUrl: 'https://i.pravatar.cc/150?img=5',
    };
    expect(useAuthStore.getState().currentUser).toEqual(updated);
    expect(updatePersistedUser).toHaveBeenCalledWith(updated);
  });

  it('トークンは変更しない', async () => {
    await performProfileUpdate(
      { name: '新しい名前', iconUrl: '' },
      { persistedUserStore: { updatePersistedUser } },
    );

    expect(useAuthStore.getState().accessToken).toBe('access-token');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-token');
  });

  it('表示名が空白のみの場合はエラーにして何も更新しない', async () => {
    await expect(
      performProfileUpdate(
        { name: '   ', iconUrl: '' },
        { persistedUserStore: { updatePersistedUser } },
      ),
    ).rejects.toThrow();

    expect(useAuthStore.getState().currentUser).toEqual(USER);
    expect(updatePersistedUser).not.toHaveBeenCalled();
  });

  it('未ログイン時はエラーにする', async () => {
    useAuthStore.getState().logout();

    await expect(
      performProfileUpdate(
        { name: '新しい名前', iconUrl: '' },
        { persistedUserStore: { updatePersistedUser } },
      ),
    ).rejects.toThrow();
    expect(updatePersistedUser).not.toHaveBeenCalled();
  });

  it('永続化に失敗してもストアの更新は維持する', async () => {
    updatePersistedUser.mockRejectedValue(new Error('secure-store failed'));

    await performProfileUpdate(
      { name: '新しい名前', iconUrl: '' },
      { persistedUserStore: { updatePersistedUser } },
    );

    expect(useAuthStore.getState().currentUser?.name).toBe('新しい名前');
  });
});
