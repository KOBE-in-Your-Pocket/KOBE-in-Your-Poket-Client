import { Pressable, View } from 'react-native';

import { styles } from './segmented-control.styles';

import { useTheme } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui/themed/themed-text';

export type Segment<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  segmentMinWidth?: number;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  segmentMinWidth,
}: Props<T>) {
  const theme = useTheme();

  return (
    <View accessibilityRole="tablist">
      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        {segments.map((seg) => {
          const isSelected = value === seg.value;
          return (
            <Pressable
              key={seg.value}
              style={[
                styles.segment,
                segmentMinWidth !== undefined ? { minWidth: segmentMinWidth } : undefined,
                isSelected ? { backgroundColor: theme.backgroundSelected } : undefined,
              ]}
              onPress={() => onChange(seg.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={seg.label}
            >
              <ThemedText
                style={styles.segmentText}
                type={isSelected ? 'smallBold' : 'small'}
                themeColor={isSelected ? 'text' : 'textSecondary'}
              >
                {seg.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
