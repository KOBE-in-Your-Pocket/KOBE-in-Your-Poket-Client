#!/usr/bin/env bash
#
# scripts/setup-emulators.sh
#
# チーム標準の Android AVD を一括作成する。
# 前提: Android Studio がインストール済み、ANDROID_HOME と PATH が設定済み。
# Apple Silicon Mac は arm64-v8a イメージを使う。Windows/Intel Mac は x86_64 に書き換え。
#

set -euo pipefail

# ── ANDROID_HOME 自動検出 ─────────────────────────────
if [[ -z "${ANDROID_HOME:-}" ]]; then
  # よくあるパスを順に探す
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
  echo "ERROR: ANDROID_HOME が見つかりません。" >&2
  echo "  export ANDROID_HOME=\"<Android SDK のパス>\" を設定してください。" >&2
  echo "  詳細: docs/dev-environment.md §5.3" >&2
  exit 1
fi

export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
echo "==> ANDROID_HOME=$ANDROID_HOME"

# Apple Silicon かどうかで ABI を切り替え
if [[ "$(uname -s)" == "Darwin" && "$(uname -m)" == "arm64" ]]; then
  ABI="arm64-v8a"
else
  ABI="x86_64"
fi

echo "==> Detected ABI: $ABI"

# 必須コマンド確認
for cmd in sdkmanager avdmanager; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: '$cmd' が見つかりません。Android Studio をインストールし、ANDROID_HOME と PATH を設定してください。" >&2
    echo "詳細: docs/dev-environment.md §5.3" >&2
    exit 1
  fi
done

# AVD 定義
# format: AVD_NAME|API_LEVEL|IMAGE_TYPE|DEVICE_PROFILE
declare -a AVDS=(
  "Pixel_4a_API30|30|google_apis|pixel_4a"
  "Pixel_8_API34|34|google_apis_playstore|pixel_8"
  "Pixel_9_API36|36|google_apis_playstore|pixel_9"
)

for entry in "${AVDS[@]}"; do
  IFS='|' read -r name api image device <<< "$entry"
  pkg="system-images;android-${api};${image};${ABI}"

  echo ""
  echo "==> [$name] API $api / image $image / device $device"

  # System Image インストール
  echo "  - SDK Manager: installing $pkg"
  # yes の SIGPIPE を無視（sdkmanager がパイプを閉じると yes が SIGPIPE で死ぬため）
  (yes 2>/dev/null || true) | sdkmanager --install "$pkg" >/dev/null

  # デバイスプロファイルが存在するか確認し、なければ代替を使う
  if ! avdmanager list device 2>/dev/null | grep -q "\"$device\""; then
    echo "  - デバイスプロファイル '$device' が見つかりません。代替を検索..."
    # pixel_8 → pixel_7, pixel_9 → pixel_7 のようにフォールバック
    fallback=$(avdmanager list device 2>/dev/null | grep -oP '"pixel_\d+"' | tr -d '"' | sort -t_ -k2 -n | tail -1)
    if [[ -n "$fallback" ]]; then
      echo "  - 代替デバイス '$fallback' を使用"
      device="$fallback"
    else
      echo "  - WARNING: 代替デバイスも見つかりません。デフォルトを使用" >&2
    fi
  fi

  # AVD が既にあれば skip
  if avdmanager list avd 2>/dev/null | grep -q "Name: $name$"; then
    echo "  - AVD '$name' は既に存在します（skip）"
    continue
  fi

  # AVD 作成
  echo "  - AVD Manager: creating $name"
  echo "no" | avdmanager create avd \
    --name "$name" \
    --package "$pkg" \
    --device "$device" >/dev/null

  # Pixel 4a だけ RAM を 3GB に絞る（低スペック検証用）
  if [[ "$name" == "Pixel_4a_API30" ]]; then
    AVD_CONFIG="$HOME/.android/avd/${name}.avd/config.ini"
    if [[ -f "$AVD_CONFIG" ]]; then
      sed -i.bak 's/^hw.ramSize=.*/hw.ramSize=3072/' "$AVD_CONFIG" 2>/dev/null || \
        echo "hw.ramSize=3072" >> "$AVD_CONFIG"
      echo "  - RAM を 3GB に設定（低スペック検証用）"
    fi
  fi
done

echo ""
echo "==> 作成完了。AVD 一覧:"
emulator -list-avds

echo ""
echo "==> 起動例:"
echo "    emulator -avd Pixel_8_API34 &"
echo "    pnpm start"
