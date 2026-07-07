import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView } from 'react-native';

import { useScopeFilterStore } from '../../store/use-scope-filter-store';

import { styles } from '../styles/scope-filter.styles';

import type { SelectedScope } from '../../store/use-scope-filter-store';

import { useTheme } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui';

const SCOPES: SelectedScope[] = ['all', 'local', 'japan'];

/**
 * マナー項目一覧の地域スコープ絞り込みチップを表示するコンポーネント。
 *
 * 「すべて」「各所特有」「日本全般」を横スクロールで表示し、タップで
 * `useScopeFilterStore` の selectedScope を更新する。
 */
export function ScopeFilter() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { selectedScope, setSelectedScope } = useScopeFilterStore();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
    >
      {SCOPES.map((scope) => {
        const isSelected = scope === selectedScope;
        return (
          <Pressable
            key={scope}
            style={[
              styles.chip,
              { backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement },
            ]}
            onPress={() => setSelectedScope(scope)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <ThemedText style={styles.chipText}>{t(`manner.scopeFilter.${scope}`)}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
