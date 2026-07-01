import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui';

import { useListModeStore, type ListMode } from '../../store/use-list-mode-store';

import { styles } from '../styles/list-mode-toggle.styles';

const LIST_MODES: ListMode[] = ['tourism', 'evacuation'];

function modeToggleKey(mode: ListMode): `list.modeToggle.${ListMode}` {
  return `list.modeToggle.${mode}`;
}

export function ListModeToggle() {
  const { t } = useTranslation();
  const theme = useTheme();
  const listMode = useListModeStore((state) => state.listMode);
  const setListMode = useListModeStore((state) => state.setListMode);

  return (
    <View accessibilityRole="tablist">
      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        {LIST_MODES.map((mode) => {
          const isSelected = listMode === mode;
          const label = t(modeToggleKey(mode));

          return (
            <Pressable
              key={mode}
              style={[
                styles.segment,
                isSelected ? { backgroundColor: theme.backgroundSelected } : undefined,
              ]}
              onPress={() => setListMode(mode)}
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
