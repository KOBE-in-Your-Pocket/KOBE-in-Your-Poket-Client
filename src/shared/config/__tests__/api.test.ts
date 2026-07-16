import { getApiBaseUrl } from '../api';

describe('getApiBaseUrl', () => {
  const original = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = original;
    }
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('未設定時は undefined を返す', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(getApiBaseUrl()).toBeUndefined();
  });

  it('末尾スラッシュを取り除く', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com/';
    expect(getApiBaseUrl()).toBe('https://api.example.com');
  });

  it('不正な URL は undefined を返す', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'not-a-url';
    expect(getApiBaseUrl()).toBeUndefined();
  });

  it('http/https 以外のプロトコルは undefined を返す', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'ftp://api.example.com';
    expect(getApiBaseUrl()).toBeUndefined();
  });

  it('本番環境では http を拒否する', () => {
    process.env.NODE_ENV = 'production';
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://api.example.com';
    expect(getApiBaseUrl()).toBeUndefined();
  });

  it('本番環境では https を許可する', () => {
    process.env.NODE_ENV = 'production';
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
    expect(getApiBaseUrl()).toBe('https://api.example.com');
  });
});
