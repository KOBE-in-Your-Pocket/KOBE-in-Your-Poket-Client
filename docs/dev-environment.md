# 開発環境セットアップガイド

このドキュメントは「Kobe in Your Pocket クライアントを開発するためのローカル環境を、チーム全員で同じ状態に揃える」ための完全ガイドです。

> **対象読者**: React Native / Expo を触ったことのない初学者を含む全メンバー
> **所要時間**: 初回 約2時間（Xcode・Android Studio のダウンロードが重い）

---

## 0. このガイドのゴール

セットアップ完了時、以下が成立している状態：

- `pnpm start` でメトロバンドラが起動できる
- iOS Simulator（iPhone 15 / iOS 18）でアプリが立ち上がる
- Android Emulator（Pixel 8 / Android 14）でアプリが立ち上がる
- `bash scripts/doctor.sh` が全項目グリーン

---

## 1. 前提環境

### 推奨マシンスペック

| 項目           | 推奨                                     | 最低                                            |
| -------------- | ---------------------------------------- | ----------------------------------------------- |
| macOS          | macOS 14 Sonoma+（Apple Silicon M1〜M4） | macOS 13+                                       |
| Windows        | Windows 11 + WSL2（Ubuntu 22.04+）       | Windows 10 + WSL2                               |
| RAM            | 16GB                                     | 8GB（Android Emulator が重い）                  |
| ストレージ空き | 100GB                                    | 50GB（Xcode + Android Studio + AVD で大量消費） |

### サポートOS（アプリのターゲット）

| プラットフォーム | 下限                | メイン              | 最新                |
| ---------------- | ------------------- | ------------------- | ------------------- |
| iOS              | iOS 16              | iOS 18              | iOS 19              |
| Android          | Android 11 (API 30) | Android 14 (API 34) | Android 16 (API 36) |

---

## 2. 共通ツールのインストール

### 2.1 mise（バージョン管理ツール、推奨）

Node / pnpm / Java のバージョンをリポジトリの `.tool-versions` から自動で揃えるために `mise` を使います。`asdf` でも代用可。

**macOS**:

```bash
brew install mise
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (WSL)**:

```bash
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc
```

リポジトリに `cd` してから：

```bash
mise install   # .tool-versions に書かれた Node / pnpm / Java を自動インストール
```

### 2.2 pnpm（Corepack 経由）

mise を使わない場合：

```bash
corepack enable
corepack prepare pnpm@11.7.0 --activate
pnpm --version   # 11.7.0
```

### 2.3 リポジトリの clone と依存インストール

```bash
git clone https://github.com/KOBE-in-Your-Pocket/KOBE-in-Your-Poket-Client.git
cd KOBE-in-Your-Poket-Client
pnpm install
```

---

## 3. iOS Simulator のセットアップ（Mac のみ）

### 3.1 Xcode のインストール

App Store から **Xcode 16+** をインストール（10GB+、回線によっては1〜2時間）。
Apple ID 必須。

インストール後、一度起動して **追加コンポーネントのインストール** を完了させる：

```bash
sudo xcode-select --install
sudo xcodebuild -license accept
```

### 3.2 iOS Runtime（複数バージョン）の追加

Xcode → メニューバー **Xcode → Settings → Platforms** タブ → **+** ボタンから以下3つを順番に追加：

| Runtime      | サイズ | 用途          |
| ------------ | ------ | ------------- |
| **iOS 16.x** | 約 7GB | 下限保証      |
| **iOS 18.x** | 約 8GB | ⭐ メイン開発 |
| **iOS 19.x** | 約 8GB | 最新追従      |

> ⚠️ ダウンロードに失敗する場合は手動ダウンロード：
> https://developer.apple.com/download/all/?q=simulator
> .dmg ファイルから `xcrun simctl runtime add <path>` で追加可能。

### 3.3 Simulator デバイス作成

ターミナルで：

```bash
xcrun simctl create "iPhone SE 3 (iOS 16)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation" \
  "com.apple.CoreSimulator.SimRuntime.iOS-16-4"

xcrun simctl create "iPhone 15 (iOS 18)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-15" \
  "com.apple.CoreSimulator.SimRuntime.iOS-18-0"

xcrun simctl create "iPhone 17 Pro (iOS 19)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro" \
  "com.apple.CoreSimulator.SimRuntime.iOS-19-0"
```

> 上記コマンドの `SimRuntime.iOS-XX-X` は実際にインストールしたRuntimeのバージョン文字列に合わせてください。確認は `xcrun simctl list runtimes`。

確認：

```bash
xcrun simctl list devices | grep -E "iPhone SE 3|iPhone 15|iPhone 17"
```

---

## 4. Android Studio / AVD のセットアップ

### 4.1 Android Studio のインストール

https://developer.android.com/studio から **Android Studio Koala (2024.1)+** をダウンロード。

**M1〜M4 Mac は必ず Apple Silicon 版を選ぶ**（Intel版を入れると x86 AVDがRosetta経由で激重）。

起動後の Setup Wizard でデフォルトの SDK Tools をインストール。

### 4.2 必要な SDK と System Image を入れる

Android Studio → **More Actions → SDK Manager** → **SDK Platforms** タブ：

- [x] Android 11 (API 30)
- [x] Android 14 (API 34)
- [x] Android 16 (API 36)

→ 各バージョンの右下「Show Package Details」をオンにして以下を選択：

| API | 必要な System Image                              |
| --- | ------------------------------------------------ |
| 30  | `Google Play ARM 64 v8a System Image` (M2 Mac用) |
| 34  | `Google Play ARM 64 v8a System Image`            |
| 36  | `Google Play ARM 64 v8a System Image`            |

> ⚠️ Mac（Apple Silicon）は **必ず `arm64-v8a` イメージ** を選ぶ。`x86_64` は Rosetta 翻訳で 5〜10倍遅い。
> Windows は `x86_64` を選ぶ。

### 4.3 環境変数の設定

`~/.zshrc` または `~/.bashrc` に追加：

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"   # macOS
# export ANDROID_HOME="$HOME/Android/Sdk"         # Linux/WSL
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

反映：

```bash
source ~/.zshrc   # or ~/.bashrc
```

### 4.4 AVD を一括作成

リポジトリの自動化スクリプトで一発：

```bash
bash scripts/setup-emulators.sh
```

これで以下の3つのAVDが作成されます：

- `Pixel_4a_API30` — Android 11、RAM 3GB（低スペック検証）
- `Pixel_8_API34` — Android 14、Play入り（メイン）
- `Pixel_9_API36` — Android 16（最新）

確認：

```bash
emulator -list-avds
```

---

## 5. 動作確認

### 5.1 doctor スクリプトで環境チェック

```bash
bash scripts/doctor.sh
```

すべての項目が `OK` になっていればセットアップ完了。

### 5.2 アプリ起動

```bash
pnpm start
```

メトロバンドラが立ち上がったら、ターミナルで：

- `i` → iOS Simulator で起動
- `a` → Android Emulator で起動
- `w` → Web ブラウザで起動

---

## 6. 推奨：エミュレータ運用ルール

| ルール                                                    | 理由                                       |
| --------------------------------------------------------- | ------------------------------------------ |
| 常時起動するのは **メイン1台のみ**（iPhone 15 + Pixel 8） | RAM 節約                                   |
| **PR レビュー時** は3バージョンで動作確認                 | リグレッション防止                         |
| 重大な機能（地図/位置/避難）は **実機でも確認**           | Emulator では検出できないバグあり          |
| Burmese 表示は **Pixel 4a API 30 で必ず確認**             | Myanmar Unicode 描画が低OSで崩れる既知問題 |
| ドイツ語表示は **iPhone 15 で確認**                       | 長文の折返し・省略の挙動                   |

---

## 7. トラブルシューティング

### Q. Android Emulator が起動しない（M2 Mac）

→ AVD に `x86_64` イメージを使っている。`arm64-v8a` で作り直し。`bash scripts/setup-emulators.sh` で正しいAVDが作られる。

### Q. iOS Simulator で「Unable to boot device」

→ Xcode → Settings → Platforms で iOS Runtime が壊れている。一度削除して再ダウンロード。

### Q. `pnpm install` が permission denied

→ `corepack enable` で `/usr/local/bin/pnpm` シンボリックリンク作成権限が無い。`sudo corepack enable` で解決。

### Q. commitlint が日本語コミットを弾く

→ プレフィックス（feat/fix/...）と `#<issue番号>` が必須。例: `feat: タブ実装 #30`

### Q. Burmese フォントが豆腐になる

→ Pixel 4a API 30 のシステムイメージに Myanmar フォントが未同梱。Android 11 の言語設定で Myanmar を追加すると引き直される。

### Q. EAS Build が必要なタイミング

→ `react-native-maps` や `expo-sqlite` のようなネイティブ依存を追加した時。Sprint 1 中盤に Dev Client を1回ビルドして全員配布する想定。

---

## 8. 参考

- spec/02_tech-stack.md — 技術スタック仕様
- spec/05_team.md — チーム構成
- spec/09_dev-environment.md — 環境仕様（バージョン定義の最上位）
- [Expo SDK 56 docs](https://docs.expo.dev/versions/v56.0.0/)
