import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { HomeCard as HomeCardDef } from '../home-cards';
import { CARD_FOREGROUND, styles } from '../styles/home-card.styles';

import { ThemedText } from '@/shared/ui';

/** ホームの Quick Access カード 1 枚。アイコン＋ラベルで該当機能へ遷移する。 */
export function HomeCard({ card }: { card: HomeCardDef }) {
  const { t } = useTranslation();
  const router = useRouter();
  const label = t(card.labelKey);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.navigate(card.href)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: card.color },
        pressed && styles.pressed,
      ]}
    >
      <SymbolView name={card.symbol} tintColor={CARD_FOREGROUND} size={28} style={styles.icon} />
      <ThemedText type="smallBold" style={[styles.label, { color: CARD_FOREGROUND }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
