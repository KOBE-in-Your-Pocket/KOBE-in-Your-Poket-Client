import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

// ── Google サインイン（iOS）─────────────────────────────────
// クライアント ID は「<id>.apps.googleusercontent.com」形式。ネイティブ側の
// URL スキームはその逆順表記（com.googleusercontent.apps.<id>）なので、ここで導出する。
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const googleIosUrlScheme = googleIosClientId
  ? `com.googleusercontent.apps.${googleIosClientId.replace(/\.apps\.googleusercontent\.com$/, '')}`
  : undefined;

// ── ローカル実機検証用の署名オーバーライド ─────────────────────
// 本番 bundle id (com.kobeinyourpocket.client) は組織の Apple Developer
// アカウントが所有しているため、無料の個人チームでは同一 id を登録できない。
// LOCAL_DEV_IOS=1 のときだけ dev 用 id + 個人チームに切り替える。
// この分岐は EAS / App Store 向けビルド（LOCAL_DEV_IOS 未設定）には一切影響しない。
const isLocalDevIos = process.env.LOCAL_DEV_IOS === '1';
const iosBundleIdentifier = isLocalDevIos
  ? 'com.kobeinyourpocket.client.dev'
  : 'com.kobeinyourpocket.client';
const iosAppleTeamId = isLocalDevIos ? process.env.IOS_DEV_TEAM_ID : undefined;

// 開発用 backend が HTTP のときだけ ATS 例外を焼き込む（シミュレータ / EAS Dev Client 向け）。
// デプロイ環境の backend は HTTPS 化済み（https://18-181-34-28.sslip.io）のため例外は不要で、
// この分岐はローカル HTTP backend を使う開発ビルドだけに効く。
// 本番 iOS ビルド（production / preview プロファイル）では例外を入れない。
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const usesHttpBackend = apiBaseUrl?.startsWith('http://') ?? false;
const isProductionIosBuild =
  process.env.EAS_BUILD_PROFILE === 'production' || process.env.EAS_BUILD_PROFILE === 'preview';
const needsInsecureHttpExceptions = !isProductionIosBuild && (isLocalDevIos || usesHttpBackend);

// EAS Build 上かどうか。EAS_BUILD_PROFILE はビルドジョブでのみ設定される。
// .env はリポジトリにコミットされず EAS Build にもアップロードされないため、
// EAS 側の環境変数（eas.json の "environment" で選択）が未設定だと
// クライアント ID が欠けたまま「一見成功する」ビルドが出来上がってしまう。
const isEasBuild = Boolean(process.env.EAS_BUILD_PROFILE);

const missingGoogleIosClientIdMessage =
  '[app.config] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID が未設定です。\n' +
  '  Google サインインの URL スキームがネイティブビルドに焼き込まれず、サインインは動作しません。\n' +
  '  ローカル: .env に設定してください（.env.example 参照）。\n' +
  '  EAS Build: eas env:set --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --environment development ...\n' +
  '  で EAS の環境変数へ登録してください（eas.json の "environment" で選択される）。';

if (!googleIosClientId) {
  // サインインが壊れたビルドを配布してしまわないよう、EAS Build では警告ではなく失敗させる。
  if (isEasBuild) {
    throw new Error(missingGoogleIosClientIdMessage);
  }
  console.warn(missingGoogleIosClientIdMessage);
}

// 認証 API の接続先。未設定だと ID トークンを送る先が無く、サインインは必ず失敗する。
// ローカルでは各 feature がモックへフォールバックするので警告に留め、
// 配布ビルドでは（Google サインインごと壊れるため）ビルドを失敗させる。
if (!apiBaseUrl) {
  const message =
    '[app.config] EXPO_PUBLIC_API_BASE_URL が未設定です。\n' +
    '  認証 API（Google サインインを含む）の接続先が無く、サインインは動作しません。\n' +
    '  ローカル: .env に設定してください（.env.example 参照）。\n' +
    '  EAS Build: eas env:set --name EXPO_PUBLIC_API_BASE_URL --environment development ... で登録してください。';
  if (isEasBuild) {
    throw new Error(message);
  }
  console.warn(message);
}

// Android は idToken の取得に種別ウェブのクライアント ID が必須（iOS では未使用）。
// 未設定だと Google サインインのボタンを押した瞬間に実行時エラーになる。
if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()) {
  console.warn(
    '[app.config] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID が未設定です。\n' +
      '  Android では idToken 取得に必須のため、Google サインインは実行時に失敗します。\n' +
      '  iOS のみ検証中であればこの警告は無視できます（.env.example 参照）。',
  );
}

if (!googleMapsApiKey) {
  console.warn(
    '[app.config] GOOGLE_MAPS_API_KEY が未設定です。\n' +
      '  この値はネイティブビルド時（EAS build / expo run:android）に AndroidManifest へ焼き込まれます。\n' +
      '  EAS 配布 APK を Dev Client として使っている場合はビルド済みのキーが入っているため、この警告は無視できます。\n' +
      '  ローカルでネイティブを作り直す場合のみ .env に設定してください（.env.example 参照）。',
  );
}

export default (): ExpoConfig => ({
  name: 'KOBE-in-Your-Poket-Client',
  slug: 'KOBE-in-Your-Poket-Client',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'kobeinyourpoketclient',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: iosBundleIdentifier,
    ...(iosAppleTeamId ? { appleTeamId: iosAppleTeamId } : {}),
    infoPlist: {
      // 開発ビルドで HTTP backend を使う場合のみ ATS 例外を設定する。
      // - LOCAL_DEV_IOS=1: 実機ローカル検証（localhost / LAN IP も許可）
      // - EXPO_PUBLIC_API_BASE_URL が http:// 始まり: ローカル HTTP backend（nip.io 等）
      // デプロイ環境は HTTPS（sslip.io）なので usesHttpBackend=false となり、例外は焼き込まれない。
      // 本番 iOS ビルド（production / preview）では例外を入れない。
      ...(needsInsecureHttpExceptions
        ? {
            NSAppTransportSecurity: {
              ...(isLocalDevIos ? { NSAllowsArbitraryLoads: true } : {}),
              NSAllowsLocalNetworking: true,
              NSExceptionDomains: {
                'nip.io': {
                  NSIncludesSubdomains: true,
                  NSExceptionAllowsInsecureHTTPLoads: true,
                  NSExceptionRequiresForwardSecrecy: false,
                },
              },
            },
          }
        : {}),
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    package: 'com.kobeinyourpocket.client',
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-dev-client',
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          '観光案内のため、現在地を地図上に表示します。周辺のおすすめスポットへのご案内に利用します。',
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
        iosGoogleMapsApiKey: googleMapsApiKey,
      },
    ],
    'expo-sqlite',
    'expo-secure-store',
    // GoogleSignIn → AppCheckCore 11.3+ が RecaptchaInterop を引き込み、Expo の静的
    // CocoaPods 統合で落ちるため、11.2.0 にピン留めする（issue #1517 の公式回避）。
    [
      'expo-build-properties',
      {
        ios: {
          extraPods: [{ name: 'AppCheckCore', version: '11.2.0' }],
        },
      },
    ],
    // URL スキーム未設定だと plugin がビルドエラーになるため、設定時のみ追加する。
    ...(googleIosUrlScheme
      ? [
          ['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }] as [
            string,
            unknown,
          ],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    autolinkingModuleResolution: true,
  },
  extra: {
    eas: {
      projectId: 'c2f0207f-1521-454c-8262-e6f22fea33bb',
    },
  },
});
