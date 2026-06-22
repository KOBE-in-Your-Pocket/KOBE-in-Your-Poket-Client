import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

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
    bundleIdentifier: 'com.kobeinyourpocket.client',
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
