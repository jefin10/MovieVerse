import { Text, color, space } from '@/ui';
import { distance, duration, easing } from '@/ui/motion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { validateSession } from './auth/api';
import { prefetchTabData } from './services/movieData';
import { ONBOARDING_KEY } from './services/push';

// Keep the native splash up until this screen can take over seamlessly.
SplashScreen.preventAutoHideAsync().catch(() => {});

const BOOTSTRAP_TIMEOUT_MS = 4000;
const PREFETCH_BLOCKING_MS = 2500;
const SLOW_NOTICE_MS = 6000;

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> =>
  new Promise((resolve) => {
    let settled = false;
    const done = (value: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => done(fallback), timeoutMs);
    promise.then(done, () => done(fallback));
  });

/** The launch screen: the same logo as the native splash, then straight to the right place. */
const LaunchScreen = () => {
  const router = useRouter();
  const [slow, setSlow] = useState(false);
  const notice = useSharedValue(0);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => {
      setSlow(true);
      notice.value = withTiming(1, { duration: duration.base, easing: easing.enter });
    }, SLOW_NOTICE_MS);
    bootstrap();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bootstrap = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const username = await AsyncStorage.getItem('username');
    if (!token || !username) {
      router.replace('/pages/LoginPage');
      return;
    }

    const valid = await withTimeout(validateSession(), BOOTSTRAP_TIMEOUT_MS, true);
    if (!valid) {
      await AsyncStorage.multiRemove(['authToken', 'username']);
      router.replace('/pages/LoginPage');
      return;
    }

    // They closed the app during first-run setup, so pick up where they left off.
    if (await AsyncStorage.getItem(ONBOARDING_KEY)) {
      router.replace('/pages/OnboardingPage');
      return;
    }

    const prefetch = prefetchTabData(username);
    await withTimeout(prefetch.then(() => true), PREFETCH_BLOCKING_MS, false);
    router.replace('/(tabs)');
  };

  const noticeStyle = useAnimatedStyle(() => ({ opacity: notice.value, transform: [{ translateY: (1 - notice.value) * distance.rise }] }));

  return (
    <View style={styles.page}>
      <Image source={require('../assets/images/MVV.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="MovieVerse" />
      <Animated.View style={[styles.notice, noticeStyle]}>
        {slow ? (
          <Text variant="label" tone="secondary" center>
            Taking longer than usual
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center' },
  // Matches the native splash image width so the hand-off is invisible.
  logo: { width: 200, height: 200 },
  notice: { position: 'absolute', bottom: space.xxxl, left: 0, right: 0 },
});

export default LaunchScreen;
