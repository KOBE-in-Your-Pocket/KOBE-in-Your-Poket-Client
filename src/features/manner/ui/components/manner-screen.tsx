import { StyleSheet } from 'react-native';

import { ThemedView } from '@/shared/ui';

import { MannerList, type RelatedSpot } from './manner-list';

export function MannerScreen({ spots }: { spots?: RelatedSpot[] }) {
  return (
    <ThemedView style={styles.container}>
      <MannerList spots={spots} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
