import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, ActivityIndicator } from 'react-native';
import api, { clearAuth } from '../auth/api';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/AuthContext';

const MIN_VISIBLE_MS = 1000; // keep the animation on screen briefly even on fast networks

const LogoutScreen = () => {
  const router = useRouter();
  const { setAuthenticated } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Branded entrance: fade + gentle scale-in.
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const startedAt = Date.now();

    const finish = () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => router.replace('/pages/LoginPage'));
    };

    const performLogout = async () => {
      try {
        await api.post('api/auth/logout/', {});
      } catch (error) {
        console.warn('Logout request failed; clearing local session anyway.', error);
      } finally {
        await clearAuth();
        setAuthenticated(false);
        // Fade out after a minimum visible time for a smooth transition.
        const elapsed = Date.now() - startedAt;
        setTimeout(finish, Math.max(0, MIN_VISIBLE_MS - elapsed));
      }
    };

    performLogout();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../../assets/images/MVV.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>See you soon</Text>
        <Text style={styles.subtitle}>Signing you out…</Text>
        <ActivityIndicator size="small" color="#ffffff" style={styles.loader} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 22,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#8a8a8a',
    fontSize: 14,
    marginTop: 8,
  },
  loader: {
    marginTop: 22,
  },
});

export default LogoutScreen;
