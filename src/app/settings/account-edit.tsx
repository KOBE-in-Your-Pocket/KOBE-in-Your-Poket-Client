import { AccountEditScreen } from '@/features/user';

/**
 * アカウント編集のルート（`/settings/account-edit`）。
 *
 * app 層はルーティングのみを担う薄いシェル。画面の中身は user feature の
 * {@link AccountEditScreen} が持つ。
 */
export default function AccountEditRoute() {
  return <AccountEditScreen />;
}
