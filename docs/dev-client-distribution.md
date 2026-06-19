# Dev Client チーム配布ガイド

地図（`react-native-maps`）などネイティブ依存を使うため、**Expo Go ではなく Dev Client** が必要です。
全員がローカルで `expo run:android` する代わりに、**EAS Build で APK を1本ビルドして配布**する手順です。

> Issue: **#64**（EAS Dev Client セットアップとチーム配布）
>
> **日常の開発コマンドは全員 `pnpm android` に統一**（エミュレータ起動 + Dev Client + Metro + ホットリロード）。

---

## 全体像

```
[配布担当] EAS Build → APK URL
      ↓ Slack 等で共有
[各メンバー] APK インストール → pnpm android → コード変更 → 自動リロード
```

| 役割       | やること                              | 頻度                 |
| ---------- | ------------------------------------- | -------------------- |
| 配布担当   | EAS Build + GCP SHA-1 登録 + URL 共有 | ネイティブ設定変更時 |
| 各メンバー | APK インストール + **`pnpm android`** | 初回 + APK 更新時    |

---

## 配布担当（初回セットアップ）

### 1. EAS CLI とログイン

```bash
pnpm dlx eas-cli login
pnpm dlx eas-cli whoami
```

初回ビルド時に Expo プロジェクトの作成/リンクを求められたら指示に従ってください。

### 2. チームが APK をダウンロードできるようにする（初回のみ）

デフォルトでは **プロジェクト所有者の Expo アカウントだけ** がビルド URL にアクセスできます。
メンバー全員が Expo アカウントなしで DL できるよう、次を **ON** にしてください。

1. [expo.dev](https://expo.dev) → **KOBE-in-Your-Poket-Client**
2. **Project settings**（歯車アイコン）
3. **「Unauthenticated access to internal builds」** を **ON**

> メンバーが「権限がない」と言ったら、この設定が OFF になっていないか確認してください。

### 3. Google Maps API キーを EAS 環境変数に登録

```bash
pnpm dlx eas-cli env:create development \
  --name GOOGLE_MAPS_API_KEY \
  --value "<GCP で発行した API キー>" \
  --visibility secret \
  --non-interactive
```

GCP プロジェクト: **KOBE-in-Your-Poket**（`kobe-in-your-poket`）

### 4. Dev Client APK をビルド

```bash
pnpm dev-client:build:android
```

ビルド完了後、EAS ダッシュボードに **APK ダウンロード URL** が表示されます。

### 5. GCP API キーに EAS の SHA-1 を追加

EAS Build で署名された APK 用の SHA-1 は、ローカル `android/app/debug.keystore` とは**異なります**。

1. [expo.dev](https://expo.dev) → プロジェクト → **Credentials** → Android
2. **SHA-1 Certificate Fingerprint** をコピー
3. [Google Cloud Console](https://console.cloud.google.com/) → 認証情報 → API キー
4. Android 制限に追加:
   - パッケージ名: `com.kobeinyourpocket.client`
   - SHA-1: EAS Credentials の値

> ローカル開発用 SHA-1 も併用する場合は、**両方**を GCP に登録してください。
>
> ```bash
> keytool -list -v \
>   -keystore android/app/debug.keystore \
>   -alias androiddebugkey \
>   -storepass android -keypass android | grep SHA1
> ```

### 6. チームへ共有

Slack 等で以下を共有:

- EAS Build の **APK ダウンロード URL**
- このドキュメントへのリンク

---

## 各メンバー（受け取り側）

### 1. Dev Client APK をインストール（初回のみ）

> **Expo アカウント不要** です（手順 2 の未認証アクセス ON 済みが前提）。

**エミュレータ:**

```bash
curl -L -o dev-client.apk "<EAS の APK URL>"
adb install -r dev-client.apk
```

**実機:** APK をダウンロードしてインストール（不明なアプリのインストールを許可）。

### 2. リポジトリを checkout

```bash
git fetch origin
git checkout develop
pnpm install
```

> **`.env` は不要** です（Maps API キーは APK に焼き込み済み）。

### 3. 開発開始（毎日これだけ）

```bash
pnpm android
```

- エミュレータ（Pixel_8_API34）を自動起動
- Dev Client + Metro を起動
- **コードを保存するとエミュレータ上で自動リロード**

### 4. 動作確認

- 観光タブで神戸周辺の地図タイルが表示される
- `/debug/map` で Map コンポーネントが表示される

---

## 再ビルドが必要なタイミング

| 変更内容                                        | 再ビルド                         |
| ----------------------------------------------- | -------------------------------- |
| JS/TS のみ（画面・ロジック）                    | 不要（`pnpm android` だけ）      |
| `app.config.ts` のプラグイン / 権限 / Maps キー | **必要**（配布担当が EAS Build） |
| ネイティブ依存の追加・更新                      | **必要**                         |

---

## コマンド一覧

| コマンド                        | 用途                                                    |
| ------------------------------- | ------------------------------------------------------- |
| **`pnpm android`**              | **全員: 日常開発**（エミュレータ + Dev Client + Metro） |
| `pnpm dev-client:build:android` | 配布担当: EAS で Android APK ビルド                     |
| `pnpm dev-client:start`         | 上級者向け: Metro のみ（通常は使わない）                |

---

## トラブルシューティング

### `Tried to register two views with the same name RNSScreenStackScreen`

Metro キャッシュまたは pnpm のモジュール二重解決が原因です。

```bash
adb shell am force-stop com.kobeinyourpocket.client
pnpm android   # --clear 付きで Metro 再起動
```

### 地図がベージュのまま

logcat で `Authorization failure` を確認:

```bash
adb logcat -d | rg -i "Authorization failure|Google Android Maps"
```

表示された `<cert_fingerprint>;<package_name>` を GCP API キー制限に追加してください。

### `Dev Client が未インストール`

共有 APK をインストールしていない状態です。上記「APK をインストール」を実施してください。

### APK の URL で「権限がない」

配布担当が expo.dev → Project settings → **Unauthenticated access to internal builds** を **ON** にしてください（§ 配布担当 手順 2）。

### Expo Go で起動してしまう / 地図が出ない

`pnpm android:raw` ではなく **`pnpm android`** を使ってください。Expo Go では地図は動きません。
