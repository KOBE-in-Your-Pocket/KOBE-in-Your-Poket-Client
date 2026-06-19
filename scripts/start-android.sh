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
ANDROID_PACKAGE="com.kobeinyourpocket.client"
EXPO_SCHEME="kobeinyourpoketclient"

dev_client_installed() {
  adb shell pm list packages 2>/dev/null | tr -d '\r' | grep -qx "package:${ANDROID_PACKAGE}"
}

run_expo() {
  if command -v pnpm >/dev/null 2>&1; then
    exec pnpm exec expo "$@"
  else
    exec npx -y pnpm@11.7.0 exec expo "$@"
  fi
}

# ── ANDROID_HOME 自動検出（Mac brew / Android Studio / WSL / Linux） ──
# シェルに ANDROID_HOME が無くてもよく使う場所を順番に試す。
if [[ -z "${ANDROID_HOME:-}" ]]; then
  CANDIDATES=(
    "/opt/homebrew/share/android-commandlinetools"   # Mac (brew cask)
    "/usr/local/share/android-commandlinetools"      # Mac Intel (brew)
    "$HOME/Library/Android/sdk"                       # Mac (Android Studio 既定)
    "$HOME/Android/Sdk"                               # Linux / WSL (Android Studio 既定)
    "$HOME/.android/sdk"                              # 一部の Linux/WSL 設定
    "/usr/lib/android-sdk"                            # Debian/Ubuntu apt パッケージ
    "/mnt/c/Users/$USER/AppData/Local/Android/Sdk"    # WSL から Windows 側 Android Studio を見る場合
  )
  for candidate in "${CANDIDATES[@]}"; do
    if [[ -d "$candidate" ]]; then
      export ANDROID_HOME="$candidate"
      echo "✓ ANDROID_HOME を $ANDROID_HOME に自動設定（永続化したいなら ~/.zshrc / ~/.bashrc に追加）"
      break
    fi
  done
fi

if [[ -z "${ANDROID_HOME:-}" ]]; then
  echo "ERROR: 環境変数 ANDROID_HOME が未設定で、候補パスにも SDK が見つかりません。" >&2
  echo "  詳細: docs/dev-environment.md §4.3" >&2
  echo "  例 (Mac brew):     export ANDROID_HOME=\"/opt/homebrew/share/android-commandlinetools\"" >&2
  echo "  例 (Android Studio Mac): export ANDROID_HOME=\"\$HOME/Library/Android/sdk\"" >&2
  echo "  例 (Linux/WSL):    export ANDROID_HOME=\"\$HOME/Android/Sdk\"" >&2
  exit 1
fi

# ANDROID_HOME 配下のツールを PATH に追加（PATH に無くても拾えるように）
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"

for cmd in emulator adb; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: '$cmd' が $ANDROID_HOME 配下に見つかりません。" >&2
    echo "  詳細: docs/dev-environment.md §4.3" >&2
    echo "  Mac brew: 'brew install --cask android-commandlinetools' でインストール" >&2
    echo "  その後:    sdkmanager --install \"platform-tools\" \"emulator\"" >&2
    exit 1
  fi
done

# ── AVD の存在確認 ────────────────────────────────
if ! emulator -list-avds 2>/dev/null | tr -d '\r' | grep -qx "${TARGET_AVD}"; then
  echo "ERROR: AVD '${TARGET_AVD}' が見つかりません。" >&2
  echo "" >&2
  echo "利用可能な AVD:" >&2
  emulator -list-avds 2>/dev/null | tr -d '\r' | sed 's/^/  /' >&2
  echo "" >&2
  echo "作成するには: bash scripts/setup-emulators.sh" >&2
  exit 1
fi

# ── 起動済みか確認 ────────────────────────────────
if adb devices 2>/dev/null | tr -d '\r' | awk 'NR>1 && $2=="device"' | grep -q '^emulator-'; then
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

# ── .env 読み込み（Maps API キーなど） ─────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib/load-env.sh
source "$SCRIPT_DIR/lib/load-env.sh"
load_env_file "$PROJECT_ROOT/.env"

# ── Expo 起動 ─────────────────────────────────────
# GOOGLE_MAPS_API_KEY がある場合は Dev Client 経由（Expo Go では Maps 設定が反映されない）。
# Dev Client が端末に入っていなければ expo run:android でビルド＆インストールする。
if [[ -n "${GOOGLE_MAPS_API_KEY:-}" ]]; then
  echo "✓ GOOGLE_MAPS_API_KEY を検出（Dev Client モード）"
  if dev_client_installed; then
    echo "▶ Dev Client (${ANDROID_PACKAGE}) + Metro を ${TARGET_AVD} に向けて起動..."
    run_expo start --dev-client --android --scheme "${EXPO_SCHEME}" --clear
  else
    if adb shell pm list packages 2>/dev/null | tr -d '\r' | grep -q "com.anonymous.KOBEinYourPoketClient"; then
      echo "⚠ 古い Dev Client (com.anonymous.KOBEinYourPoketClient) が残っています"
      echo "  ビルド後に問題があれば: adb uninstall com.anonymous.KOBEinYourPoketClient"
    fi
    echo "▶ Dev Client (${ANDROID_PACKAGE}) をビルドして ${TARGET_AVD} にインストール（数分かかります）..."
    run_expo run:android
  fi
else
  echo "⚠ GOOGLE_MAPS_API_KEY 未設定 → Expo Go で起動（地図タイルは表示されません）"
  echo "  .env.example を .env にコピーしてキーを設定すると Dev Client モードになります"
  echo "▶ Expo Go を ${TARGET_AVD} に向けて起動..."
  run_expo start --android
fi
