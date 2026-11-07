import { Icon, type IconName } from './Icon';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { distance, duration, easing, exitDuration, toastHold } from './motion';
import { Text } from './Text';
import { Touchable } from './Touchable';
import { color, gutter, icon, radius, space } from './tokens';

export type ToastMessage = {
  title: string;
  body?: string;
  icon?: IconName;
  tone?: 'default' | 'error';
  onPress?: () => void;
};

const ToastContext = createContext<{ show: (toast: ToastMessage) => void }>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

/** The app's only toast: slides 16px down from the top and fades in, gone after 3s. */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const shown = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    shown.value = withTiming(0, { duration: exitDuration.base, easing: easing.exit }, (done) => {
      if (done) runOnJS(setToast)(null);
    });
  }, [shown]);

  const show = useCallback(
    (next: ToastMessage) => {
      clearTimeout(timer.current);
      setToast(next);
      shown.value = withTiming(1, { duration: duration.base, easing: easing.enter });
      timer.current = setTimeout(hide, toastHold);
    },
    [hide, shown],
  );

  const animated = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: reduceMotion ? [] : [{ translateY: (shown.value - 1) * distance.toast }],
  }));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View style={[styles.wrap, { top: insets.top + space.sm }, animated]} pointerEvents="box-none">
          <Touchable
            feedback="opacity"
            accessibilityRole={toast.onPress ? 'button' : 'alert'}
            accessibilityLiveRegion="polite"
            onPress={() => {
              hide();
              toast.onPress?.();
            }}
            style={styles.toast}
          >
            <View style={styles.iconWrap}>
              <Icon
                name={toast.icon ?? (toast.tone === 'error' ? 'alert-circle' : 'check')}
                size={icon.inline}
                color={toast.tone === 'error' ? color.danger : color.text}
              />
            </View>
            <View style={styles.text}>
              <Text variant="label" bold numberOfLines={1}>
                {toast.title}
              </Text>
              {toast.body ? (
                <Text variant="label" tone="secondary" numberOfLines={2}>
                  {toast.body}
                </Text>
              ) : null}
            </View>
          </Touchable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: gutter, right: gutter, zIndex: 100, elevation: 20 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.container,
    backgroundColor: color.raised,
  },
  iconWrap: { width: space.xl, alignItems: 'center' },
  text: { flex: 1, gap: space.xs },
});
