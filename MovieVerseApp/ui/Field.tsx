import { Icon, type IconName } from './Icon';
import React, { forwardRef, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { distance, duration, easing } from './motion';
import { Text } from './Text';
import { color, font, icon, radius, size, space } from './tokens';

type Props = Omit<TextInputProps, 'style' | 'editable'> & {
  label?: string;
  error?: string;
  leadingIcon?: IconName;
  trailing?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The only text field. Label above, error below, both in the same place every
 * time. States: default, focused (border and label brighten in 150ms), filled,
 * error (border turns red, message fades in with one 3px nudge), disabled.
 */
export const Field = forwardRef<TextInput, Props>(
  ({ label, error, leadingIcon, trailing, disabled, style, onFocus, onBlur, ...input }, ref) => {
    const reduceMotion = useReducedMotion();
    const [focused, setFocused] = useState(false);
    const focus = useSharedValue(0);
    const errorShown = useSharedValue(error ? 1 : 0);
    const nudge = useSharedValue(0);

    useEffect(() => {
      focus.value = withTiming(focused ? 1 : 0, { duration: duration.fast, easing: focused ? easing.enter : easing.exit });
    }, [focused, focus]);

    useEffect(() => {
      errorShown.value = withTiming(error ? 1 : 0, { duration: duration.fast, easing: easing.enter });
      if (error && !reduceMotion) {
        nudge.value = withSequence(
          withTiming(distance.nudge, { duration: duration.instant / 2 }),
          withTiming(0, { duration: duration.instant, easing: easing.enter }),
        );
      }
    }, [error, errorShown, nudge, reduceMotion]);

    const boxStyle = useAnimatedStyle(() => ({
      borderColor: error ? color.danger : interpolateColor(focus.value, [0, 1], [color.divider, color.text]),
    }));
    const labelStyle = useAnimatedStyle(() => ({
      color: interpolateColor(focus.value, [0, 1], [color.textSecondary, color.text]),
    }));
    const errorStyle = useAnimatedStyle(() => ({
      opacity: errorShown.value,
      transform: [{ translateX: nudge.value }],
    }));

    return (
      <View style={[disabled && styles.disabled, style]}>
        {label ? <Animated.Text style={[font.label, styles.label, labelStyle]}>{label}</Animated.Text> : null}
        <Animated.View style={[styles.box, boxStyle]}>
          {leadingIcon ? <Icon name={leadingIcon} size={icon.inline} color={color.textSecondary} /> : null}
          <TextInput
            ref={ref}
            {...input}
            editable={!disabled}
            accessibilityLabel={input.accessibilityLabel ?? label}
            placeholderTextColor={color.textTertiary}
            selectionColor={color.text}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={styles.input}
          />
          {trailing}
        </Animated.View>
        {error ? (
          <Animated.View style={errorStyle}>
            <Text variant="label" tone="danger" style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    );
  },
);
Field.displayName = 'Field';

const styles = StyleSheet.create({
  label: { marginBottom: space.sm },
  box: {
    height: size.control,
    borderRadius: radius.control,
    borderWidth: 1,
    backgroundColor: color.surface,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  input: { flex: 1, height: '100%', color: color.text, fontSize: font.body.fontSize, padding: 0 },
  error: { marginTop: space.sm },
  disabled: { opacity: 0.4 },
});

export default Field;
