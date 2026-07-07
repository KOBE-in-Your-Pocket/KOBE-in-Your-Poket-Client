import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView } from 'react-native';

import { useKindFilterStore } from '../../store/use-kind-filter-store';

import { styles } from '../styles/kind-filter.styles';

import type { SelectedKind } from '../../store/use-kind-filter-store';

import { useTheme } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui';

const KINDS: SelectedKind[] = ['all', 'manner', 'rule'];

/**
 * マナー項目一覧の種別絞り込みチップを表示するコンポーネント。
 *
 * 「すべて」「マナー」「ルール」を横スクロールで表示し、タップで
 * `useKindFilterStore` の selectedKind を更新する。
 */
export function KindFilter() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { selectedKind, setSelectedKind } = useKindFilterStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
    >
      {KINDS.map((kind) => {
        const isSelected = kind === selectedKind;
        return (
          <Pressable
            key={kind}
            style={[
              styles.chip,
              { backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement },
            ]}
            onPress={() => setSelectedKind(kind)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <ThemedText style={styles.chipText}>{t(`manner.kindFilter.${kind}`)}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
