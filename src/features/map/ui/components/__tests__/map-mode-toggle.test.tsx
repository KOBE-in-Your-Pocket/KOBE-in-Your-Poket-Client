import { fireEvent, render, screen } from '@testing-library/react-native';
import { useTranslation } from 'react-i18next';
import { Text as MockThemedText } from 'react-native';

import { useUiStore } from '@/shared/store';

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
  useUiStore: jest.fn(
    (selector: (state: { language: string; setLanguage: jest.Mock }) => unknown) =>
      selector({ language: 'ja', setLanguage: jest.fn() }),
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

jest.mock('@/shared/ui', () => ({
  ThemedText: MockThemedText,
}));

const mockedUseTranslation = jest.mocked(useTranslation);
const mockedUseUiStore = jest.mocked(useUiStore);

describe('MapModeToggle', () => {
  beforeEach(() => {
    useMapModeStore.setState({ mapMode: 'tourism' });
    mockedUseTranslation.mockReturnValue({
      i18n: {
        getFixedT: () => (key: string) => {
          const labels: Record<string, string> = {
            'map.modeToggle.tourism': '観光',
            'map.modeToggle.evacuation': '避難',
          };
          return labels[key] ?? key;
        },
      },
    } as ReturnType<typeof useTranslation>);
    mockedUseUiStore.mockImplementation((selector) =>
      selector({ language: 'ja', setLanguage: jest.fn() }),
    );
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
    mockedUseTranslation.mockReturnValue({
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
    } as ReturnType<typeof useTranslation>);
    mockedUseUiStore.mockImplementation((selector) =>
      selector({ language: 'en', setLanguage: jest.fn() }),
    );

    render(<MapModeToggle />);

    expect(screen.getByText('Tourism')).toBeTruthy();
    expect(screen.getByText('Evacuation')).toBeTruthy();
  });
});
