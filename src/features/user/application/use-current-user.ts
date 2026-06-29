import type { PublicUser } from '../domain/public-user';

// 認証実装までの暫定固定ユーザー（レビュー投稿者として使用）。
const CURRENT_USER: PublicUser = {
  name: '荒川蓮',
  iconUrl: 'https://i.pravatar.cc/150?img=68',
};

export function useCurrentUser(): PublicUser {
  return CURRENT_USER;
}
