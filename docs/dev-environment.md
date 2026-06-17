# 開発環境セットアップガイド

このドキュメントは「Kobe in Your Pocket クライアントを開発するためのローカル環境を、チーム全員で同じ状態に揃える」ための完全ガイドです。

> **対象読者**: React Native / Expo を触ったことのない初学者を含む全メンバー
> **所要時間**: 初回 約2時間（Xcode・Android Studio のダウンロードが重い）

---

## TL;DR (一括セットアップ)

時間がない人向けの最短コース：

### macOS の場合

```bash
# 1. リポジトリ取得
git clone https://github.com/KOBE-in-Your-Pocket/KOBE-in-Your-Poket-Client.git
cd KOBE-in-Your-Poket-Client

# 2. Node + pnpm + 依存を一括セットアップ (Node 未インストールでも案内が出る)
bash scripts/bootstrap.sh

# 3. 環境チェック (Xcode / Android SDK の状態が一覧で見える)
bash scripts/doctor.sh

# 4. Mac で iOS 動作確認 (Xcode 必要)
pnpm ios

# 5. Android 動作確認 (Android SDK 必要)
pnpm android
```

### Windows (WSL2) の場合

```bash
# 0. WSL2 + Ubuntu をまだ入れてない場合（PowerShell を管理者で実行）
#    wsl --install -d Ubuntu

# 1. WSL2 ターミナル (Ubuntu) で実行
git clone https://github.com/KOBE-in-Your-Pocket/KOBE-in-Your-Poket-Client.git
cd KOBE-in-Your-Poket-Client

# 2. Node + pnpm + 依存を一括セットアップ
bash scripts/bootstrap.sh

# 3. WSL2 で Android エミュレータを動かす前提を整える（libpulse0 + KVM）
bash scripts/setup-wsl.sh
#    kvm グループに追加された場合は、PowerShell で `wsl --shutdown` し
#    Ubuntu を開き直してから次に進む（メッセージの指示に従う）

# 4. 環境チェック
bash scripts/doctor.sh

# 5. AVD を一括作成（未作成の場合）→ エミュレータ起動
bash scripts/setup-emulators.sh
bash scripts/start-android.sh

# 5. Web で動作確認（iOS は Mac のみ）
pnpm web
```

> **Windows ユーザーへ**: iOS 開発は Mac 必須です。Windows では **Android + Web** で開発し、iOS は CI または Mac 持ちメンバーに依頼してください。

`bootstrap.sh` は冪等なので何度実行しても安全。Node が未インストールだったり、Corepack が権限不足だったりした場合は、スクリプトが具体的な対処手順を出力します。

それでも詰まった場合は、以下の各章を順に読んでください。

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

バージョン管理ツールは下記から **どれか1つ** 選んでください。それぞれリポジトリの設定ファイルを自動で読みます。

| ツール | 読むファイル     | おすすめ用途                                       |
| ------ | ---------------- | -------------------------------------------------- |
| `mise` | `.tool-versions` | **Node + pnpm + Java を一括** 管理したい人（推奨） |
| `asdf` | `.tool-versions` | 既に asdf 使ってる人                               |
| `nvm`  | `.nvmrc`         | Node だけ管理する人、定番ツール                    |
| `fnm`  | `.node-version`  | nvm より高速なツール                               |

### 2.1 mise（推奨）

Node / pnpm / Java をリポジトリの `.tool-versions` から自動で揃えます。

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

### 2.2 nvm

Node だけ管理。インストールは [nvm 公式](https://github.com/nvm-sh/nvm#installing-and-updating) を参照。

```bash
# nvm 導入済みの前提
cd KOBE-in-Your-Poket-Client
nvm install   # .nvmrc から 22.16.0 を読んでインストール
nvm use       # 22.16.0 に切替
```

`.nvmrc` を毎回 `nvm use` で読みに行くのが面倒なら、shell hook（[公式 README の Deeper Shell Integration](https://github.com/nvm-sh/nvm#deeper-shell-integration)）を設定すると `cd` で自動切替されます。

### 2.3 pnpm（Corepack 経由）

`mise` を使うなら不要（pnpm も同時に入る）。`nvm` や手動 Node の場合は別途：

```bash
corepack enable
corepack prepare pnpm@11.7.0 --activate
pnpm --version   # 11.7.0
```

### 2.4 リポジトリの clone と依存インストール

```bash
git clone https://github.com/KOBE-in-Your-Pocket/KOBE-in-Your-Poket-Client.git
cd KOBE-in-Your-Poket-Client
pnpm install
```

---

## 3. Windows (WSL2) 固有のセットアップ

Windows ユーザーは WSL2 上で開発します。ここでは Windows 特有の手順とハマりやすいポイントをまとめます。

> Mac ユーザーはこの章をスキップして §4 に進んでください。

### 3.1 WSL2 のインストール

PowerShell を **管理者として実行** し：

```powershell
wsl --install -d Ubuntu
```

インストール後、再起動してから Ubuntu ターミナルを起動。ユーザー名とパスワードを設定する。

既に WSL2 が入っている場合はバージョン確認：

```bash
wsl --version
# WSL バージョン: 2.x.x.x 以上であること
```

### 3.2 WSL2 内の基本パッケージ

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget unzip git
```

### 3.3 リポジトリの配置場所（重要）

**WSL2 のファイルシステム内** にクローンすること。`/mnt/c/` や `/mnt/d/` など Windows 側のドライブ上で作業すると、ファイル I/O が 5〜10倍遅くなり `pnpm install` やメトロバンドラに深刻な影響が出る。

```bash
# 良い例（WSL2 ネイティブ）
cd ~
git clone https://github.com/KOBE-in-Your-Pocket/KOBE-in-Your-Poket-Client.git

# 悪い例（Windows ドライブ経由 → 激遅）
cd /mnt/c/Users/yourname/Desktop
git clone ...   # ← やめてください
```

> もし既に `/mnt/c/` 配下で作業してしまった場合は、WSL2 ホーム (`~`) に `git clone` し直すのが最も早い解決策です。

### 3.4 Android Studio を Windows 側にインストール

> **方式の選択**: §3.4〜3.7 は Windows 側に Android Studio を入れる方式。Windows に Android Studio を入れず WSL2 内で完結させたい場合は §3.8 を参照（どちらか一方でよい）。

Android Studio は **Windows 側（WSL2 の外）** にインストールします。

1. https://developer.android.com/studio から Windows 版をダウンロード・インストール
2. Setup Wizard でデフォルトの SDK をインストール
3. SDK のデフォルトパスは `C:\Users\<ユーザー名>\AppData\Local\Android\Sdk`

### 3.5 WSL2 から Windows 側の Android SDK を参照する

WSL2 の `~/.bashrc` に以下を追加：

```bash
# Windows 側の Android SDK を WSL2 から参照
# <ユーザー名> を自分の Windows ユーザー名に置き換える
export ANDROID_HOME="/mnt/c/Users/<ユーザー名>/AppData/Local/Android/Sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

反映：

```bash
source ~/.bashrc
```

確認：

```bash
adb version        # → Android Debug Bridge version x.x.x
emulator -list-avds # → AVD 名が表示される
```

### 3.6 Windows 側の adb.exe と WSL2 側の adb の競合を防ぐ

WSL2 と Windows の両方に `adb` がいると、ポート競合でデバイスが見えなくなることがある。

**対処法**: WSL2 には `adb` をインストールせず、Windows 側の `adb.exe` だけを使う（§3.5 の PATH 設定で自動的にそうなる）。

```bash
# 確認: adb のパスが Windows 側を指しているか
which adb
# → /mnt/c/Users/.../Android/Sdk/platform-tools/adb であること
```

### 3.7 エミュレータの起動

Android Emulator は **Windows 側で起動** する必要がある。WSL2 内から `emulator` コマンドで起動すると GUI が出ない場合がある。

**方法1: Android Studio から起動（推奨）**

Windows 側で Android Studio を開き、Device Manager からエミュレータを起動。起動後に WSL2 側から `pnpm android` を実行。

**方法2: WSL2 から emulator.exe を直接実行**

```bash
# Windows 側の emulator を呼ぶ（.exe 不要、PATH が通っていれば動く）
emulator -avd Pixel_8_API34 &
```

> WSLg が有効な場合は WSL2 から直接 GUI 表示できるが、GPU アクセラレーションが効かず重いことがある。Android Studio から起動するのが安定。

### 3.8 代替方式: WSL2 ネイティブで完結させる

§3.4〜3.7 は **Windows 側に Android Studio を入れて WSL2 から `/mnt/c/...` の SDK を参照する**方式。これとは別に、**Android SDK もエミュレータも WSL2 内で完結させる**方式もある。Windows 側に Android Studio を入れたくない・WSL2 だけで閉じたい場合はこちら。

> どちらか一方でよい。両方を混在させると `adb` や AVD パスが競合しやすいので、片方に統一すること。

WSL2 では KVM によるハードウェア仮想化が使えるため、エミュレータをヘッドレス（GUI なし）で十分実用的に動かせる。

**① Android command-line tools を WSL2 に入れる**

```bash
# ビルド用 JDK
sudo apt update && sudo apt install -y openjdk-17-jdk unzip wget

# command-line tools を ~/android-sdk に配置
# 最新版の URL は https://developer.android.com/studio#command-line-tools-only から取得
mkdir -p ~/android-sdk/cmdline-tools
cd /tmp
wget -O cmdline-tools.zip "https://dl.google.com/android/repository/commandlinetools-linux-<VERSION>_latest.zip"
unzip -q cmdline-tools.zip
mv cmdline-tools ~/android-sdk/cmdline-tools/latest
```

**② 環境変数を設定**（`~/.bashrc` に追記）

```bash
# WSL2 ネイティブの Android SDK
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

```bash
source ~/.bashrc

# ライセンス同意 + 基本コンポーネント
sdkmanager --licenses
sdkmanager "platform-tools" "emulator"
```

> このプロジェクトのスクリプト（`doctor.sh` / `setup-emulators.sh` / `start-android.sh`）は `~/android-sdk` を自動検出するので、上記の `ANDROID_HOME` を設定しておけば追加設定は不要。

**③ エミュレータ起動の前提を整える（libpulse0 + KVM）**

```bash
bash scripts/setup-wsl.sh
```

- `libpulse0`（無いとエミュレータが起動直後に落ちる）を導入
- `$USER` を `kvm` グループに追加（`/dev/kvm` へのアクセスに必須）
- **`kvm` グループに追加された場合は WSL の再起動が必要**。メッセージの指示どおり PowerShell で `wsl --shutdown` → Ubuntu を開き直す → `bash scripts/doctor.sh` で確認

**④ AVD を作成して起動**

```bash
bash scripts/setup-emulators.sh   # AVD 一括作成（x86_64 イメージ）
bash scripts/start-android.sh     # ヘッドレス起動 + Metro
```

手動でヘッドレス起動したい場合：

```bash
emulator -avd Pixel_8_API34 -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect &
adb wait-for-device
adb shell getprop sys.boot_completed   # → 1 になれば起動完了
```

> `-no-window` で GUI を出さずに動かす。画面を見たい時は `-no-window` を外せば WSLg 経由で表示できる（GPU アクセラレーションが効かず重いことがある）。

---

## 4. iOS Simulator のセットアップ（Mac のみ）

### 4.1 Xcode のインストール

App Store から **Xcode 16+** をインストール（10GB+、回線によっては1〜2時間）。
Apple ID 必須。

インストール後、一度起動して **追加コンポーネントのインストール** を完了させる：

```bash
sudo xcode-select --install
sudo xcodebuild -license accept
```

### 4.2 iOS Runtime（複数バージョン）の追加

Xcode → メニューバー **Xcode → Settings → Platforms** タブ → **+** ボタンから以下3つを順番に追加：

| Runtime      | サイズ | 用途          |
| ------------ | ------ | ------------- |
| **iOS 16.x** | 約 7GB | 下限保証      |
| **iOS 18.x** | 約 8GB | ⭐ メイン開発 |
| **iOS 19.x** | 約 8GB | 最新追従      |

> ⚠️ ダウンロードに失敗する場合は手動ダウンロード：
> https://developer.apple.com/download/all/?q=simulator
> .dmg ファイルから `xcrun simctl runtime add <path>` で追加可能。

### 4.3 Simulator デバイス作成

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

## 5. Android Studio / AVD のセットアップ

### 5.1 Android Studio のインストール

https://developer.android.com/studio からダウンロード。

| OS      | 注意点                                                                |
| ------- | --------------------------------------------------------------------- |
| macOS   | **M1〜M4 Mac は Apple Silicon 版** を選ぶ（Intel版は x86 AVD が激重） |
| Windows | **Windows 版** をインストール（WSL2 内ではなく Windows 側）           |

起動後の Setup Wizard でデフォルトの SDK Tools をインストール。

### 5.2 必要な SDK と System Image を入れる

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

### 5.3 環境変数の設定

#### macOS の場合

`~/.zshrc` に追加：

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

```bash
source ~/.zshrc
```

#### Windows (WSL2) の場合

> §3.5 で設定済みの場合はスキップ。

`~/.bashrc` に追加：

```bash
# <ユーザー名> を自分の Windows ユーザー名に置き換える
export ANDROID_HOME="/mnt/c/Users/<ユーザー名>/AppData/Local/Android/Sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

```bash
source ~/.bashrc
```

> **確認**: `echo $ANDROID_HOME` でパスが表示され、`adb version` が動作すれば OK。

### 5.4 AVD を一括作成

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

## 6. 動作確認

### 6.1 doctor スクリプトで環境チェック

```bash
bash scripts/doctor.sh
```

すべての項目が `OK` になっていればセットアップ完了。

### 6.2 アプリ起動

```bash
pnpm start
```

メトロバンドラが立ち上がったら、ターミナルで：

- `i` → iOS Simulator で起動
- `a` → Android Emulator で起動
- `w` → Web ブラウザで起動

---

## 7. 推奨：エミュレータ運用ルール

| ルール                                                    | 理由                                       |
| --------------------------------------------------------- | ------------------------------------------ |
| 常時起動するのは **メイン1台のみ**（iPhone 15 + Pixel 8） | RAM 節約                                   |
| **PR レビュー時** は3バージョンで動作確認                 | リグレッション防止                         |
| 重大な機能（地図/位置/避難）は **実機でも確認**           | Emulator では検出できないバグあり          |
| Burmese 表示は **Pixel 4a API 30 で必ず確認**             | Myanmar Unicode 描画が低OSで崩れる既知問題 |
| ドイツ語表示は **iPhone 15 で確認**                       | 長文の折返し・省略の挙動                   |

---

## 8. トラブルシューティング

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

### Q. (Windows) `pnpm install` が異常に遅い / ファイル監視が効かない

→ `/mnt/c/` や `/mnt/d/` など **Windows ドライブ上** でプロジェクトを開いている。WSL2 ネイティブのファイルシステム（`~/` 以下）にクローンし直す（§3.3 参照）。

### Q. (Windows) `adb devices` でデバイスが表示されない

→ 原因は主に3つ：

1. **adb の競合**: WSL2 と Windows 両方に adb がある。`which adb` で `/mnt/c/...` を指しているか確認。WSL2 に `android-tools` を apt で入れた場合は `sudo apt remove android-tools-adb` で削除。
2. **adb server のバージョン不一致**: Windows 側で `adb kill-server && adb start-server` を実行してからリトライ。
3. **ANDROID_HOME のパスミス**: `ls $ANDROID_HOME/platform-tools/adb` または `ls $ANDROID_HOME/platform-tools/adb.exe` でファイルが存在するか確認。ユーザー名のスペースや日本語に注意。

### Q. (Windows) `emulator` コマンドで「PANIC: Cannot find AVD system path」

→ AVD は Windows のユーザーフォルダに保存されるが、WSL2 から参照する際にパスが通っていない。`~/.bashrc` に以下を追加：

```bash
export ANDROID_AVD_HOME="/mnt/c/Users/<ユーザー名>/.android/avd"
```

### Q. (Windows) メトロバンドラにスマホ実機から接続できない

→ WSL2 はデフォルトで NAT ネットワーク。実機からは `localhost` ではなく Windows ホストの IP でアクセスする必要がある。

```bash
# WSL2 内で Windows ホストの IP を確認
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
```

Expo の場合は `pnpm start --tunnel` を使うと ngrok 経由で接続できる（チーム内テスト向け）。

### Q. (Windows) Git の改行コードで diff が大量に出る

→ Windows / WSL2 間で CRLF ↔ LF の変換が起きている。WSL2 内で以下を設定：

```bash
git config --global core.autocrlf input
```

既にクローン済みのリポジトリは改行コードをリセット：

```bash
git rm --cached -r .
git reset --hard
```

### Q. (Windows) VS Code から WSL2 のプロジェクトを開くには

→ VS Code の **Remote - WSL** 拡張をインストールし、WSL2 ターミナルから `code .` で開く。Windows 側のエクスプローラーから `\\wsl$\Ubuntu\home\...` を開くのは避ける（パフォーマンスが悪い）。

---

## 9. 参考

- spec/02_tech-stack.md — 技術スタック仕様
- spec/05_team.md — チーム構成
- spec/09_dev-environment.md — 環境仕様（バージョン定義の最上位）
- [Expo SDK 56 docs](https://docs.expo.dev/versions/v56.0.0/)
