import { create } from 'zustand';

import type { PublicUser } from '../domain/public-user';

type AuthState = {
  /** ログイン中のユーザー。未ログイン時は null。 */
  currentUser: PublicUser | null;
  /** ログインし、現在ユーザーを設定する。 */
  login: (user: PublicUser) => void;
  /** ログアウトし、現在ユーザーを未設定（null）にする。 */
  logout: () => void;
};

/**
 * ログイン状態（現在ユーザー）を保持するストア（#397）。
 *
 * 起動時は未ログイン（currentUser=null）。ログイン導線（別要件）が `login()`
 * を呼んで現在ユーザーを設定する。mock のためメモリ保持（アプリ再起動で
 * リセットされる）。実 API 化時はトークン検証結果でこのストアを更新する。
 */
export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));
