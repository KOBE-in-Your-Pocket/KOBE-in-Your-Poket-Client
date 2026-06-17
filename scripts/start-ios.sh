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

# ── すでに booted ならスキップ ────────────────────
if xcrun simctl list devices booted 2>/dev/null | grep -q "${TARGET_DEVICE}"; then
  echo "✓ ${TARGET_DEVICE} は既に起動済み"
else
  echo "▶ ${TARGET_DEVICE} を起動..."
  xcrun simctl boot "${TARGET_DEVICE}"
fi

# ── Simulator.app を前面に ────────────────────────
open -a Simulator
sleep 2

# ── Expo 起動 ─────────────────────────────────────
echo "▶ Expo を ${TARGET_DEVICE} に向けて起動..."
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm exec expo start --ios
else
  exec npx -y pnpm@11.7.0 exec expo start --ios
fi
