import {
  TabList,
  TabListProps,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_COLORS, TAB_BAR_CONTENT_HEIGHT, TAB_DEFS } from './tab-bar-config';

import { Spacing } from '@/shared/config';
import { ThemedText } from '@/shared/ui';

export function CustomTabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarInset = TAB_BAR_CONTENT_HEIGHT + Math.max(insets.bottom, Spacing.two);

  return (
    <Tabs>
      <View style={[styles.content, { paddingBottom: tabBarInset }]}>
        <TabSlot style={styles.tabSlot} />
      </View>
      <TabList asChild>
        <CustomTabList>
          {TAB_DEFS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton symbol={tab.symbol}>{t(tab.labelKey)}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  children,
  isFocused,
  symbol,
  ...props
}: TabTriggerSlotProps & { symbol: (typeof TAB_DEFS)[number]['symbol'] }) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View style={[styles.tabButtonInner, isFocused && styles.tabButtonInnerFocused]}>
        <SymbolView
          tintColor={isFocused ? TAB_BAR_COLORS.active : TAB_BAR_COLORS.inactive}
          name={symbol}
          size={22}
        />
        <ThemedText
          type="small"
          style={[
            styles.tabLabel,
            { color: isFocused ? TAB_BAR_COLORS.active : TAB_BAR_COLORS.inactive },
          ]}
        >
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[styles.tabListContainer, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}
    >
      <View style={styles.tabBar}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  tabSlot: {
    flex: 1,
  },
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: TAB_BAR_COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 64,
  },
  tabButtonInnerFocused: {
    borderColor: TAB_BAR_COLORS.activeBorder,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
