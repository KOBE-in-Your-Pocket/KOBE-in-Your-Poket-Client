let sessionGeneration = 0;

/** 進行中のセッション復元を無効化する（ログアウト・新規サインイン時）。 */
export function bumpSessionGeneration(): void {
  sessionGeneration += 1;
}

/** セッション操作の世代を取得する。 */
export function getSessionGeneration(): number {
  return sessionGeneration;
}

/** 指定世代の操作がまだ有効かどうかを返す。 */
export function isSessionGenerationCurrent(generation: number): boolean {
  return sessionGeneration === generation;
}

/** テスト用: 世代カウンタをリセットする。 */
export function resetSessionGenerationForTests(): void {
  sessionGeneration = 0;
}
