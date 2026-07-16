import { useMutation } from '@tanstack/react-query';

import type { AuthSession, EmailSignUpResult } from '../domain/auth-session';
import type { AuthGateway, SessionStore } from '../domain/auth-ports';
import { useAuthStore } from '../store/use-auth-store';
import { defaultAuthGateway, defaultSessionStore } from './auth-deps';
import {
  bumpSessionGeneration,
  getSessionGeneration,
  isSessionGenerationCurrent,
} from './session-operation';

type EmailAuthDeps = {
  authGateway: AuthGateway;
  sessionStore: SessionStore;
};

const defaultDeps: EmailAuthDeps = {
  authGateway: defaultAuthGateway,
  sessionStore: defaultSessionStore,
};

export type EmailSignInInput = {
  email: string;
  password: string;
};

export type EmailSignUpInput = {
  email: string;
  password: string;
  name: string;
};

/**
 * backend 発行のセッションを永続化してストアへ反映する。
 * 進行中に別のセッション操作が始まった場合（世代が進んだ場合）は null を返して何もしない。
 */
async function commitSession(
  session: AuthSession,
  generation: number,
  sessionStore: SessionStore,
): Promise<AuthSession | null> {
  if (!isSessionGenerationCurrent(generation)) {
    return null;
  }

  await sessionStore.savePersistedSession(session);
  if (!isSessionGenerationCurrent(generation)) {
    return null;
  }

  useAuthStore.getState().setSession(session);
  return session;
}

/** メールアドレスとパスワードでサインインし、永続化・ストア更新まで行う。 */
export async function performEmailSignIn(
  input: EmailSignInInput,
  deps: EmailAuthDeps = defaultDeps,
): Promise<AuthSession | null> {
  bumpSessionGeneration();
  const generation = getSessionGeneration();

  const session = await deps.authGateway.signInWithEmail(input);
  return commitSession(session, generation, deps.sessionStore);
}

/**
 * メールアドレスとパスワードで新規登録する。
 * backend がセッションを発行した場合は永続化・ストア更新まで行いログイン状態になる。
 * メール確認が有効な場合は confirmationRequired が返り、ログイン状態にはならない
 * （ユーザーは確認メールのリンクを開いてからログインする）。
 * 進行中に別のセッション操作が始まった場合は null を返す。
 */
export async function performEmailSignUp(
  input: EmailSignUpInput,
  deps: EmailAuthDeps = defaultDeps,
): Promise<EmailSignUpResult | null> {
  bumpSessionGeneration();
  const generation = getSessionGeneration();

  const result = await deps.authGateway.signUpWithEmail(input);
  if (result.status === 'confirmationRequired') {
    return result;
  }

  const session = await commitSession(result.session, generation, deps.sessionStore);
  return session ? result : null;
}

/** メールサインインを実行する mutation。 */
export function useEmailSignIn() {
  return useMutation({
    mutationFn: (input: EmailSignInInput) => performEmailSignIn(input),
  });
}

/** メール新規登録を実行する mutation。 */
export function useEmailSignUp() {
  return useMutation({
    mutationFn: (input: EmailSignUpInput) => performEmailSignUp(input),
  });
}
