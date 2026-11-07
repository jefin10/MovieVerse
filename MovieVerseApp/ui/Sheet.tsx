import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { duration, easing, exitDuration, spring } from './motion';
import { Text } from './Text';
import { color, gutter, radius, space } from './tokens';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;
const OFFSCREEN = 800;

type SheetProps = { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode };

/**
 * One bottom sheet. Slides up on the spring while the backdrop fades to 40% in
 * 250ms. Drag down to dismiss: far or fast enough closes, otherwise it springs back.
 */
export const Sheet = ({ visible, onClose, title, children }: SheetProps) => {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(OFFSCREEN);
  const backdrop = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdrop.value = withTiming(1, { duration: duration.base, easing: easing.enter });
      if (reduceMotion) y.value = 0;
      else {
        y.value = OFFSCREEN;
        y.value = withSpring(0, spring);
      }
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: exitDuration.base, easing: easing.exit });
      y.value = withTiming(reduceMotion ? 0 : OFFSCREEN, { duration: exitDuration.base, easing: easing.exit }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const drag = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      y.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) runOnJS(onClose)();
      else y.value = withSpring(0, { ...spring, velocity: e.velocityY });
    });

  const panel = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: reduceMotion ? backdrop.value : 1,
  }));
  const shade = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  return (
    <Modal visible={mounted} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, shade]}>
          <Pressable style={styles.fill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <GestureDetector gesture={drag}>
          <Animated.View style={[styles.panel, { paddingBottom: insets.bottom + space.lg }, panel]} accessibilityViewIsModal>
            <View style={styles.handle} />
            {title ? (
              <Text variant="section" style={styles.title} accessibilityRole="header">
                {title}
              </Text>
            ) : null}
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

type ConfirmProps = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

/** Destructive actions confirm here, never in an alert. */
export const ConfirmSheet = ({ visible, title, confirmLabel, onConfirm, onClose }: ConfirmProps) => (
  <Sheet visible={visible} onClose={onClose} title={title}>
    <View style={styles.actions}>
      <Button
        title={confirmLabel}
        onPress={() => {
          onClose();
          onConfirm();
        }}
      />
      <Button variant="text" title="Cancel" onPress={onClose} />
    </View>
  </Sheet>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { backgroundColor: color.scrim },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.container,
    borderTopRightRadius: radius.container,
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    maxHeight: '85%',
  },
  handle: { alignSelf: 'center', width: space.xxl, height: space.xs, borderRadius: radius.control, backgroundColor: color.divider, marginBottom: space.lg },
  title: { marginBottom: space.lg },
  actions: { gap: space.sm },
});
