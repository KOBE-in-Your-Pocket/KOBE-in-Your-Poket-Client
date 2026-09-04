import { statusCodes } from '@react-native-google-signin/google-signin';

import { AuthApiError } from '../../domain/auth-api-error';
import { GoogleSignInConfigError } from '../../domain/google-sign-in-config-error';
import { resolveGoogleSignInErrorKind } from '../use-google-sign-in';

describe('resolveGoogleSignInErrorKind', () => {
  it('クライアント ID 未設定は configMissing', () => {
    expect(resolveGoogleSignInErrorKind(new GoogleSignInConfigError('未設定'))).toBe(
      'configMissing',
    );
  });

  it('backend のエラーレスポンスは backendRejected', () => {
    expect(resolveGoogleSignInErrorKind(new AuthApiError(400, 'Bad ID token'))).toBe(
      'backendRejected',
    );
  });

  it('Play 開発者サービス未利用可は playServicesUnavailable', () => {
    const error = Object.assign(new Error('play services'), {
      code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
    });

    expect(resolveGoogleSignInErrorKind(error)).toBe('playServicesUnavailable');
  });

  it('サインイン処理の重複は inProgress', () => {
    const error = Object.assign(new Error('in progress'), { code: statusCodes.IN_PROGRESS });

    expect(resolveGoogleSignInErrorKind(error)).toBe('inProgress');
  });

  it('fetch の通信失敗は network', () => {
    expect(resolveGoogleSignInErrorKind(new TypeError('Network request failed'))).toBe('network');
  });

  it('分類できないエラーは unknown', () => {
    expect(resolveGoogleSignInErrorKind(new Error('謎のエラー'))).toBe('unknown');
    expect(resolveGoogleSignInErrorKind(undefined)).toBe('unknown');
  });
});
