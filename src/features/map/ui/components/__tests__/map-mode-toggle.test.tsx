import { fireEvent, render, screen } from '@testing-library/react-native';

import { useMapModeStore } from '../../../store/use-map-mode-store';

import { MapModeToggle } from '../map-mode-toggle';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    i18n: {
      getFixedT: () => (key: string) => {
        const labels: Record<string, string> = {
          'map.modeToggle.tourism': '観光',
          'map.modeToggle.evacuation': '避難',
        };
        return labels[key] ?? key;
      },
    },
  })),
}));

jest.mock('@/shared/store', () => ({
  useUiStore: jest.fn((selector: (state: { language: string }) => unknown) =>
    selector({ language: 'ja' }),
  ),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/shared/config', () => ({
  Spacing: { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 },
}));

jest.mock('@/shared/lib/theme', () => ({
  useTheme: () => ({
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    text: '#000000',
    textSecondary: '#60646C',
  }),
}));

jest.mock('@/shared/ui', () => {
  const { Text } = require('react-native');
  return { ThemedText: Text };
});

describe('MapModeToggle', () => {
  beforeEach(() => {
    useMapModeStore.setState({ mapMode: 'tourism' });
  });

  it('観光と避難のラベルを表示する', () => {
    render(<MapModeToggle />);

    expect(screen.getByText('観光')).toBeTruthy();
    expect(screen.getByText('避難')).toBeTruthy();
  });

  it('避難をタップすると mapMode が evacuation になる', () => {
    render(<MapModeToggle />);

    fireEvent.press(screen.getByText('避難'));

    expect(useMapModeStore.getState().mapMode).toBe('evacuation');
  });

  it('観光をタップすると mapMode が tourism になる', () => {
    useMapModeStore.setState({ mapMode: 'evacuation' });

    render(<MapModeToggle />);

    fireEvent.press(screen.getByText('観光'));

    expect(useMapModeStore.getState().mapMode).toBe('tourism');
  });

  it('uiStore の言語に応じたラベルを表示する', () => {
    const { useUiStore } = jest.requireMock('@/shared/store') as {
      useUiStore: jest.Mock;
    };
    const { useTranslation } = jest.requireMock('react-i18next') as {
      useTranslation: jest.Mock;
    };

    useTranslation.mockReturnValue({
      i18n: {
        getFixedT: (language: string) => (key: string) => {
          const labels: Record<string, Record<string, string>> = {
            en: {
              'map.modeToggle.tourism': 'Tourism',
              'map.modeToggle.evacuation': 'Evacuation',
            },
            ja: {
              'map.modeToggle.tourism': '観光',
              'map.modeToggle.evacuation': '避難',
            },
          };
          return labels[language]?.[key] ?? key;
        },
      },
    });
    useUiStore.mockImplementation((selector: (state: { language: string }) => unknown) =>
      selector({ language: 'en' }),
    );

    render(<MapModeToggle />);

    expect(screen.getByText('Tourism')).toBeTruthy();
    expect(screen.getByText('Evacuation')).toBeTruthy();
  });
});
