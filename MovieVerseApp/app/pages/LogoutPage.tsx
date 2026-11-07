import { Text, color, space } from '@/ui';
import { distance, duration, easing, exitDuration } from '@/ui/motion';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import api, { clearAuth } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { unregisterFromPush } from '../services/push';

const MIN_VISIBLE_MS = 1000; // long enough to read, even on a fast network

const LogoutScreen = () => {
  const router = useRouter();
  const { setAuthenticated } = useAuth();
  const shown = useSharedValue(0);

  useEffect(() => {
    shown.value = withTiming(1, { duration: duration.base, easing: easing.enter });
    const startedAt = Date.now();
    const leave = () => router.replace('/pages/LoginPage');

    (async () => {
      try {
        await unregisterFromPush();
        await api.post('api/auth/logout/', {});
      } catch {
        // Clearing the local session is what matters.
      } finally {
        await clearAuth();
        setAuthenticated(false);
        setTimeout(() => {
          shown.value = withTiming(0, { duration: exitDuration.base, easing: easing.exit }, (done) => {
            if (done) runOnJS(leave)();
          });
        }, Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt)));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = useAnimatedStyle(() => ({ opacity: shown.value, transform: [{ translateY: (1 - shown.value) * distance.rise }] }));

  return (
    <View style={styles.page}>
      <Animated.View style={[styles.content, content]}>
        <Image source={require('../../assets/images/MVV.png')} style={styles.logo} resizeMode="contain" />
        <Text tone="secondary">Signing out</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg },
  content: { alignItems: 'center', gap: space.lg },
  logo: { width: space.xxxl * 2, height: space.xxxl * 2 },
});

export default LogoutScreen;
