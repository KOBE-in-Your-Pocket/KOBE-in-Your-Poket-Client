import { renderHook } from '@testing-library/react-native';

import { useCurrentUser } from '../use-current-user';

describe('useCurrentUser', () => {
  it('固定の公開ユーザー（name / iconUrl）を返す', () => {
    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.name).toBeTruthy();
    expect(result.current.iconUrl).toMatch(/^https?:\/\//);
  });
});
