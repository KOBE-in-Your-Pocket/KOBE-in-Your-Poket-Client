import { render, screen } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';

import { MannerPictogram } from '../manner-pictogram';

jest.mock('expo-image', () => ({
  Image: ({ source }: { source: number }) => <MockText>{`image:${source}`}</MockText>,
}));

jest.mock('../manner-icon', () => ({
  MannerIcon: ({ icon, size }: { icon: string; size?: number }) => (
    <MockText>{`icon:${icon}:${size}`}</MockText>
  ),
}));

describe('MannerPictogram', () => {
  it('画像が登録済みの icon キーには画像を表示する', () => {
    render(<MannerPictogram icon="no-eating-while-walking" size={40} />);

    expect(screen.getByText(/^image:/)).toBeTruthy();
    expect(screen.queryByText(/^icon:/)).toBeNull();
  });

  it('画像が未登録の icon キーには既存の MannerIcon にフォールバックする', () => {
    render(<MannerPictogram icon="no-white-clothes-in-kinsen" size={40} />);

    expect(screen.getByText('icon:no-white-clothes-in-kinsen:22')).toBeTruthy();
    expect(screen.queryByText(/^image:/)).toBeNull();
  });

  it('未知の icon キーにもフォールバックする', () => {
    render(<MannerPictogram icon="unknown-key" size={32} />);

    expect(screen.getByText('icon:unknown-key:18')).toBeTruthy();
  });
});
