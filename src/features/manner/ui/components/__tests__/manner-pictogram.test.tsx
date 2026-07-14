import { render, screen } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';

import { MannerPictogram } from '../manner-pictogram';

jest.mock('expo-image', () => ({
  Image: ({
    source,
    style,
    contentFit,
  }: {
    source: number;
    style?: { width?: number; height?: number; borderRadius?: number };
    contentFit?: string;
  }) => (
    <MockText>{`image:${source}:${style?.width}:${style?.height}:${style?.borderRadius}:${contentFit}`}</MockText>
  ),
}));

jest.mock('../manner-icon', () => ({
  MannerIcon: ({ icon, size }: { icon: string; size?: number }) => (
    <MockText>{`icon:${icon}:${size}`}</MockText>
  ),
}));

describe('MannerPictogram', () => {
  it('imageKey が画像アセットに対応している場合は画像を size に応じたスタイルで表示する（一覧: size=40）', () => {
    render(
      <MannerPictogram
        manner={{ icon: 'no-eating-while-walking', imageKey: 'no-eating-while-walking' }}
        size={40}
      />,
    );

    expect(screen.getByText(/^image:.*:40:40:20:cover$/)).toBeTruthy();
    expect(screen.queryByText(/^icon:/)).toBeNull();
  });

  it('imageKey が画像アセットに対応している場合は画像を size に応じたスタイルで表示する（スポット詳細: size=32）', () => {
    render(
      <MannerPictogram
        manner={{ icon: 'put-trash-in-bin', imageKey: 'put-trash-in-bin' }}
        size={32}
      />,
    );

    expect(screen.getByText(/^image:.*:32:32:16:cover$/)).toBeTruthy();
  });

  it.each([
    [1, 0.5],
    [21, 10.5],
  ])('端数を含む size=%i でも borderRadius が size/2（%s）になる', (size, expectedBorderRadius) => {
    render(
      <MannerPictogram
        manner={{ icon: 'show-consideration', imageKey: 'show-consideration' }}
        size={size}
      />,
    );

    expect(
      screen.getByText(new RegExp(`^image:.*:${size}:${size}:${expectedBorderRadius}:cover$`)),
    ).toBeTruthy();
  });

  it('imageKey が null の場合は既存の MannerIcon にフォールバックする', () => {
    render(
      <MannerPictogram manner={{ icon: 'no-white-clothes-in-kinsen', imageKey: null }} size={40} />,
    );

    expect(screen.getByText('icon:no-white-clothes-in-kinsen:22')).toBeTruthy();
    expect(screen.queryByText(/^image:/)).toBeNull();
  });

  it('imageKey が画像アセットに対応していない場合は既存の MannerIcon にフォールバックする', () => {
    render(
      <MannerPictogram manner={{ icon: 'unknown-icon', imageKey: 'unknown-key' }} size={32} />,
    );

    expect(screen.getByText('icon:unknown-icon:18')).toBeTruthy();
    expect(screen.queryByText(/^image:/)).toBeNull();
  });

  it.each(['constructor', 'toString', '__proto__'])(
    'Object.prototype 由来のプロパティと衝突する imageKey（%s）にもフォールバックする',
    (imageKey) => {
      render(<MannerPictogram manner={{ icon: 'safe-icon', imageKey }} size={40} />);

      expect(screen.getByText('icon:safe-icon:22')).toBeTruthy();
      expect(screen.queryByText(/^image:/)).toBeNull();
    },
  );
});
