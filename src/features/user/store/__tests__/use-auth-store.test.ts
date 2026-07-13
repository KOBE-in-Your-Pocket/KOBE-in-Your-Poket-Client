import { useAuthStore } from '../use-auth-store';

const INITIAL_STATE = useAuthStore.getState();

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState(INITIAL_STATE);
  });

  describe('初期 state', () => {
    it('起動時は未ログイン（currentUser が null）', () => {
      expect(useAuthStore.getState().currentUser).toBeNull();
    });
  });

  describe('logout', () => {
    it('currentUser を null にする', () => {
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().currentUser).toBeNull();
    });
  });

  describe('login', () => {
    it('渡したユーザーを currentUser に設定する', () => {
      const user = { name: '山田花子', iconUrl: 'https://example.com/hanako.png' };

      useAuthStore.getState().login(user);

      expect(useAuthStore.getState().currentUser).toEqual(user);
    });

    it('logout 後でも login で再度ログインできる', () => {
      const user = { name: '佐藤太郎', iconUrl: 'https://example.com/taro.png' };

      useAuthStore.getState().logout();
      useAuthStore.getState().login(user);

      expect(useAuthStore.getState().currentUser).toEqual(user);
    });
  });
});
