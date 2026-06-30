import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/shared/config';
import { useTheme } from '@/shared/lib/theme';
import { useUiStore } from '@/shared/store';
import { ThemedText } from '@/shared/ui';

import { useMapModeStore, type MapMode } from '../../store/use-map-mode-store';

import { styles } from '../styles/map-mode-toggle.styles';

const MAP_MODES: MapMode[] = ['tourism', 'evacuation'];

function modeToggleKey(mode: MapMode): `map.modeToggle.${MapMode}` {
  return `map.modeToggle.${mode}`;
}

/**
 * 地図画面右上の観光⇄避難モード切替トグル。
 *
 * `useMapModeStore` の mapMode を更新し、選択中モードを視覚的に強調する。
 * ラベルは設定画面と同じ uiStore の言語を基準に i18n から解決する。
 */
export function MapModeToggle() {
  const { i18n } = useTranslation();
  const language = useUiStore((state) => state.language);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const mapMode = useMapModeStore((state) => state.mapMode);
  const setMapMode = useMapModeStore((state) => state.setMapMode);

  const tMap = useMemo(() => i18n.getFixedT(language), [i18n, language]);

  return (
    <View style={[styles.container, { top: insets.top + Spacing.two }]} accessibilityRole="tablist">
      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        {MAP_MODES.map((mode) => {
          const isSelected = mapMode === mode;
          const label = tMap(modeToggleKey(mode));

          return (
            <Pressable
              key={mode}
              style={[
                styles.segment,
                isSelected ? { backgroundColor: theme.backgroundSelected } : undefined,
              ]}
              onPress={() => setMapMode(mode)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={label}
            >
              <ThemedText
                style={styles.segmentText}
                type={isSelected ? 'smallBold' : 'small'}
                themeColor={isSelected ? 'text' : 'textSecondary'}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
