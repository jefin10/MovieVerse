import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Button, IconButton } from './Button';
import { Reveal } from './Motion';
import { Text } from './Text';
import { Touchable } from './Touchable';
import { color, gutter, hairline, icon, radius, size, space } from './tokens';

/** A screen. Tab screens leave the bottom inset to the tab bar. */
export const Screen = ({ children, edges = ['top'], style }: { children: React.ReactNode; edges?: Edge[]; style?: StyleProp<ViewStyle> }) => (
  <SafeAreaView edges={edges} style={[styles.screen, style]}>
    {children}
  </SafeAreaView>
);

type HeaderProps = {
  title?: string;
  /** Show a back arrow above the title. */
  back?: boolean;
  onBack?: () => void;
  /** Secondary actions, right of the title. */
  actions?: React.ReactNode;
};

/**
 * Every screen's header: an optional back row, then the title on the shared
 * left edge with secondary actions on the right.
 */
export const Header = ({ title, back, onBack, actions }: HeaderProps) => {
  const router = useRouter();
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)' as any)));
  return (
    <View style={styles.header}>
      {back ? (
        <View style={styles.backRow}>
          <IconButton name="arrow-left" label="Back" onPress={goBack} style={styles.backButton} />
        </View>
      ) : null}
      {title || actions ? (
        <View style={styles.titleRow}>
          <Text variant="title" numberOfLines={1} style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      ) : null}
    </View>
  );
};

/** The thumb zone: where a screen's primary action always sits. */
export const BottomBar = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.bottomBar, style]}>{children}</View>
);

export const SectionHeader = ({ title, style }: { title: string; style?: StyleProp<TextStyle> }) => (
  <Text variant="section" accessibilityRole="header" style={[styles.sectionHeader, style]}>
    {title}
  </Text>
);

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => <View style={[styles.divider, style]} />;

type CardProps = { children: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; accessibilityLabel?: string };

/** One card style: surface fill, 12 radius, 16 padding, no shadow. */
export const Card = ({ children, onPress, style, accessibilityLabel }: CardProps) =>
  onPress ? (
    <Touchable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={[styles.card, style]}>
      {children}
    </Touchable>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );

type EmptyProps = { message: string; action?: { label: string; onPress: () => void }; style?: StyleProp<ViewStyle> };

/** Empty, error and finished states: one short line, at most one action, one fade-in. */
export const EmptyState = ({ message, action, style }: EmptyProps) => (
  <Reveal style={[styles.empty, style]}>
    <Text tone="secondary" center>
      {message}
    </Text>
    {action ? <Button variant="secondary" title={action.label} onPress={action.onPress} style={styles.emptyAction} /> : null}
  </Reveal>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  header: { paddingHorizontal: gutter, paddingTop: space.sm, paddingBottom: space.lg },
  backRow: { height: size.iconButton, justifyContent: 'center', marginBottom: space.xs },
  // Pull the 44px target left so the arrow itself sits on the shared edge.
  backButton: { marginLeft: -((size.iconButton - icon.action) / 2) },
  titleRow: { minHeight: size.iconButton, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  title: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginRight: -((size.iconButton - icon.action) / 2) },
  bottomBar: { paddingHorizontal: gutter, paddingTop: space.md, paddingBottom: space.lg, gap: space.md, backgroundColor: color.bg },
  sectionHeader: { marginBottom: space.md },
  divider: { height: hairline, backgroundColor: color.divider },
  card: { backgroundColor: color.surface, borderRadius: radius.container, padding: space.lg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xxl, paddingVertical: space.xxxl, gap: space.lg },
  emptyAction: { alignSelf: 'center' },
});
