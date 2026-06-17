#!/usr/bin/env bash
#
# scripts/start-android.sh
#
# `pnpm android` から呼ばれるラッパー。
# チーム共通のメイン機種 "Pixel_8_API34" を自動で起動してから Expo を立ち上げる。
# 既に起動済みなら再起動しない。
#

set -euo pipefail

TARGET_AVD="Pixel_8_API34"

# ── ANDROID_HOME 自動検出 ─────────────────────────────
if [[ -z "${ANDROID_HOME:-}" ]]; then
  for candidate in \
    "$HOME/Library/Android/sdk" \
    "$HOME/Android/Sdk" \
    "$HOME/android-sdk" \
  ; do
    if [[ -d "$candidate/cmdline-tools" ]]; then
      export ANDROID_HOME="$candidate"
      break
    fi
  done
fi

if [[ -z "${ANDROID_HOME:-}" ]]; then
  echo "ERROR: 環境変数 ANDROID_HOME が未設定です。" >&2
  echo "  詳細: docs/dev-environment.md §5.3" >&2
  echo "  例:   export ANDROID_HOME=\"\$HOME/Library/Android/sdk\"   # macOS" >&2
  echo "  例:   export ANDROID_HOME=\"\$HOME/android-sdk\"           # WSL2" >&2
  exit 1
fi

export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

# ── 前提チェック ──────────────────────────────────
for cmd in emulator adb; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: '$cmd' が PATH に見つかりません。" >&2
    echo "  詳細: docs/dev-environment.md §5.3" >&2
    exit 1
  fi
done

# ── AVD の存在確認 ────────────────────────────────
if ! emulator -list-avds 2>/dev/null | grep -qx "${TARGET_AVD}"; then
  echo "ERROR: AVD '${TARGET_AVD}' が見つかりません。" >&2
  echo "" >&2
  echo "利用可能な AVD:" >&2
  emulator -list-avds 2>/dev/null | sed 's/^/  /' >&2
  echo "" >&2
  echo "作成するには: bash scripts/setup-emulators.sh" >&2
  exit 1
fi

# ── 起動済みか確認 ────────────────────────────────
if adb devices 2>/dev/null | awk 'NR>1 && $2=="device"' | grep -q '^emulator-'; then
  echo "✓ Android Emulator は既に起動済み"
else
  echo "▶ ${TARGET_AVD} を起動（バックグラウンド）..."
  nohup emulator -avd "${TARGET_AVD}" -no-snapshot-load >/tmp/emulator.log 2>&1 &
  EMU_PID=$!
  echo "  PID: $EMU_PID"

  echo "▶ デバイス検出待ち..."
  adb wait-for-device

  echo "▶ boot 完了待ち（最大3分）..."
  WAIT=0
  while [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]]; do
    sleep 3
    WAIT=$((WAIT + 3))
    if [[ $WAIT -ge 180 ]]; then
      echo "ERROR: boot がタイムアウトしました。/tmp/emulator.log を確認してください。" >&2
      exit 1
    fi
  done
  echo "✓ boot 完了"
fi

# ── Expo 起動 ─────────────────────────────────────
echo "▶ Expo を ${TARGET_AVD} に向けて起動..."
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm exec expo start --android
else
  exec npx -y pnpm@11.7.0 exec expo start --android
fi
