#!/usr/bin/env bash
#
# scripts/start-ios.sh
#
# `pnpm ios` から呼ばれるラッパー。
# チーム共通のメイン機種 "iPhone 15" を自動で起動してから Expo を立ち上げる。
# 既に起動済みなら再 boot しない。
#

set -euo pipefail

TARGET_DEVICE="iPhone 15"

# ── 前提チェック ──────────────────────────────────
if ! command -v xcrun >/dev/null 2>&1; then
  echo "ERROR: Xcode が見つかりません。App Store からインストールしてください。" >&2
  echo "  詳細: docs/dev-environment.md §3" >&2
  exit 1
fi

# ── Simulator デバイスの存在確認 ─────────────────
if ! xcrun simctl list devices available 2>/dev/null | grep -q "${TARGET_DEVICE}"; then
  echo "ERROR: Simulator '${TARGET_DEVICE}' が見つかりません。" >&2
  echo "" >&2
  echo "利用可能な iOS Simulator:" >&2
  xcrun simctl list devices available 2>/dev/null | sed 's/^/  /' >&2
  echo "" >&2
  echo "iOS 18 Runtime が未インストールの可能性。Xcode → Settings → Platforms で追加してください。" >&2
  exit 1
fi

# ── 既に booted な「別機種」をシャットダウン ──────
# 他機種が立ってると Expo がそっちを掴むので、メイン以外は落とす
OTHERS=$(xcrun simctl list devices booted 2>/dev/null | grep -E "iPhone|iPad" | grep -v "${TARGET_DEVICE}" | sed -n 's/.*(\([0-9A-F-]*\)) (Booted).*/\1/p')
if [[ -n "$OTHERS" ]]; then
  echo "▶ メイン以外の Simulator をシャットダウン..."
  echo "$OTHERS" | while read -r udid; do
    [[ -z "$udid" ]] && continue
    name=$(xcrun simctl list devices 2>/dev/null | grep "$udid" | sed -E 's/^[[:space:]]+([^(]+).*/\1/' | xargs)
    echo "  - $name ($udid)"
    xcrun simctl shutdown "$udid" 2>/dev/null || true
  done
fi

# ── メイン機種を boot（既に booted ならスキップ） ─
if xcrun simctl list devices booted 2>/dev/null | grep -q "${TARGET_DEVICE}"; then
  echo "✓ ${TARGET_DEVICE} は既に起動済み"
else
  echo "▶ ${TARGET_DEVICE} を起動..."
  xcrun simctl boot "${TARGET_DEVICE}"
fi

# ── Simulator.app を前面に ────────────────────────
open -a Simulator
sleep 2

# ── Expo 起動（--device で機種を明示し expo の自動選択を上書き） ─
echo "▶ Expo を ${TARGET_DEVICE} に向けて起動..."
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm exec expo start --ios --device "${TARGET_DEVICE}"
else
  exec npx -y pnpm@11.7.0 exec expo start --ios --device "${TARGET_DEVICE}"
fi
