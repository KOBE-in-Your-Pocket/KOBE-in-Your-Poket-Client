# Dev Client チーム配布ガイド

地図（`react-native-maps`）などネイティブ依存を使うため、**Expo Go ではなく Dev Client** が必要です。
全員がローカルで `expo run:android` する代わりに、**EAS Build で APK を1本ビルドして配布**する手順です。

> Issue: **#64**（EAS Dev Client セットアップとチーム配布）
>
> **前提:** Issue #14（地図コンポーネント / ローカル Dev Client 設定）が `develop` にマージ済みであること。
> ローカル開発のみの場合は [`dev-environment.md`](./dev-environment.md) の `pnpm android` を参照。

---

## 全体像

```
[配布担当] EAS Build → APK URL
      ↓ Slack 等で共有
[各メンバー] APK インストール → pnpm dev-client:start → Dev Client から Metro 接続
```

| 役割       | やること                              | 頻度                 |
| ---------- | ------------------------------------- | -------------------- |
| 配布担当   | EAS Build + GCP SHA-1 登録 + URL 共有 | ネイティブ設定変更時 |
| 各メンバー | APK インストール + Metro 起動         | 初回 + APK 更新時    |

---

## 配布担当（初回セットアップ）

### 1. EAS CLI とログイン

```bash
pnpm exec eas-cli login
pnpm exec eas-cli whoami
```

初回ビルド時に Expo プロジェクトの作成/リンクを求められたら指示に従ってください。

### 2. Google Maps API キーを EAS Secret に登録

```bash
pnpm exec eas-cli secret:create \
  --scope project \
  --name GOOGLE_MAPS_API_KEY \
  --value "<GCP で発行した API キー>"
```

GCP プロジェクト: **KOBE-in-Your-Poket**（`kobe-in-your-poket`）

### 3. Dev Client APK をビルド

```bash
pnpm dev-client:build:android
```

ビルド完了後、EAS ダッシュボードに **APK ダウンロード URL** が表示されます。

### 4. GCP API キーに EAS の SHA-1 を追加

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

### 5. チームへ共有

Slack 等で以下を共有:

- EAS Build の **APK ダウンロード URL**
- このドキュメントへのリンク

---

## 各メンバー（受け取り側）

### 1. Dev Client APK をインストール

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

> **`.env` は APK 利用時には不要** です（Maps API キーは APK に焼き込み済み）。
> ローカルで `expo run:android` する場合のみ `.env.example` → `.env` が必要です（#14 マージ後）。

### 3. Metro を起動

```bash
pnpm dev-client:start
```

ターミナルに QR コード / URL が表示されます。

### 4. Dev Client アプリから接続

- エミュレータ: 自動接続、または Dev Client 内から URL を入力
- 実機: 同一 Wi‑Fi + QR スキャン

### 5. 動作確認

- 観光タブで神戸周辺の地図タイルが表示される
- `/debug/map` で Map コンポーネントが表示される

---

## 再ビルドが必要なタイミング

| 変更内容                                        | 再ビルド           |
| ----------------------------------------------- | ------------------ |
| JS/TS のみ（画面・ロジック）                    | 不要（Metro だけ） |
| `app.config.ts` のプラグイン / 権限 / Maps キー | **必要**           |
| ネイティブ依存の追加・更新                      | **必要**           |

---

## コマンド一覧

| コマンド                        | 用途                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `pnpm dev-client:build:android` | 配布担当: EAS で Android APK ビルド                  |
| `pnpm dev-client:start`         | 各メンバー: Metro 起動（Dev Client 接続用）          |
| `pnpm android`                  | ローカル: エミュレータ起動 + Dev Client ビルド/Metro |

---

## トラブルシューティング

### `Tried to register two views with the same name RNSScreenStackScreen`

Metro キャッシュまたは pnpm のモジュール二重解決が原因です。

```bash
# Dev Client を完全終了してから
adb shell am force-stop com.kobeinyourpocket.client
pnpm dev-client:start   # --clear 付きで Metro 再起動
```

`metro.config.js`（#14 で追加）が `develop` に入っていることを確認してください。解消しない場合は Dev Client の再ビルド:

```bash
pnpm android   # expo run:android が走る場合
```

### 地図がベージュのまま

logcat で `Authorization failure` を確認:

```bash
adb logcat -d | rg -i "Authorization failure|Google Android Maps"
```

表示された `<cert_fingerprint>;<package_name>` を GCP API キー制限に追加してください。

### `No development build ... is installed`

共有 APK をインストールしていない状態です。上記「APK をインストール」を実施してください。

### Expo Go で起動してしまう

`pnpm android:raw` ではなく `pnpm dev-client:start` + Dev Client アプリを使ってください。
