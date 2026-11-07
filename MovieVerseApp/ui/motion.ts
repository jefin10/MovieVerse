/**
 * The app's one motion language. Every animation reads its duration, easing and
 * distance from here. Exits run about 30% faster than entrances.
 */
import { Easing as RNEasing } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const duration = {
  instant: 100, // press feedback
  fast: 150, // toggles, chips, focus, small state changes
  base: 250, // screen elements, sheets, toasts
  slow: 350, // full-screen transitions
  count: 400, // numbers and progress moving to a new value
} as const;

/** Exit durations: about 30% faster than the matching entrance. */
export const exitDuration = {
  fast: Math.round(duration.fast * 0.7),
  base: Math.round(duration.base * 0.7),
} as const;

/** Reanimated easings. */
export const easing = {
  enter: Easing.bezier(0.2, 0, 0, 1),
  exit: Easing.bezier(0.4, 0, 1, 1),
};

/** The same curves for React Native's Animated (navigation transitions). */
export const easingRN = {
  enter: RNEasing.bezier(0.2, 0, 0, 1),
  exit: RNEasing.bezier(0.4, 0, 1, 1),
};

/** For gestures and draggable elements. Clamped so it never visibly bounces. */
export const spring = { stiffness: 300, damping: 28, mass: 1, overshootClamping: true } as const;

export const distance = {
  rise: 8, // content fading in moves up this far
  toast: 16, // toasts slide in from this far above
  nudge: 3, // an error's single horizontal nudge
} as const;

export const press = { scale: 0.97, opacity: 0.85 } as const;

export const stagger = { step: 35, maxItems: 6 } as const;

export const shimmerLoop = 1400;
export const toastHold = 3000;
