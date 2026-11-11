import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { saveAuthToken } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import Image from '../components/CachedImage';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const POSTERS = [
  ['/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', '/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg', '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg'],
  ['/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg', '/l33oR0mnvf20avWyIMxW02EtQxn.jpg', '/mmd1HnuvAzFc4iuVJcnBrhDNEKr.jpg', '/hGGC9gKo7CFE3fW07RA587e5kol.jpg'],
  ['/icmmSD4vTTDKOq2vvdulafOGw93.jpg', '/rlay2M5QYvi6igbGcFjq8jxeusY.jpg', '/sCzcYW9h55WcesOqA12cgEr9Exw.jpg', '/aCHn2TXYJfzPXQKA6r9mKPbMlUB.jpg'],
];

const GOOGLE_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_ENABLED === 'true';
// Only needed with a Web OAuth client. Android clients sign in with an access token.
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/** A slow, endless column of posters. Repeats its list so the loop has no visible seam. */
const PosterColumn = ({ posters, width, reverse }: { posters: string[]; width: number; reverse: boolean }) => {
  const height = (width * 1.5 + 10) * posters.length;
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(drift, { toValue: 1, duration: 46000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [drift]);
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: reverse ? [-height, 0] : [0, -height] });
  return (
    <Animated.View style={{ width, transform: [{ translateY }] }}>
      {[...posters, ...posters].map((p, i) => (
        <Image key={`${p}-${i}`} source={{ uri: `${POSTER_BASE}${p}` }} style={{ width, height: width * 1.5, borderRadius: 12, marginBottom: 10, backgroundColor: '#141414' }} />
      ))}
    </Animated.View>
  );
};

const LoginScreen = () => {
  const { width } = useWindowDimensions();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState('');
  const { setAuthenticated } = useAuth();
  const router = useRouter();

  const columnWidth = (width - 20) / 3 - 7;

  const signInWithGoogle = async () => {
    setGoogleBusy(true);
    setError('');
    try {
      GoogleSignin.configure(GOOGLE_WEB_CLIENT_ID ? { webClientId: GOOGLE_WEB_CLIENT_ID } : {});
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      if (result.type !== 'success') return;

      const body = result.data.idToken
        ? { id_token: result.data.idToken }
        : { access_token: (await GoogleSignin.getTokens()).accessToken };
      const { data } = await api.post('api/auth/google/', body);

      if (data.needs_username) {
        await AsyncStorage.multiSet([
          ['signupToken', data.signup_token],
          ['suggestedUsername', data.suggested_username ?? ''],
        ]);
        router.push('/pages/RegisterPage');
        return;
      }
      await saveAuthToken(data.token);
      await AsyncStorage.setItem('username', data.username);
      setAuthenticated(true);
      router.replace('/(tabs)');
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return;
      console.log('Google sign-in error:', err?.code, err?.response?.data || err?.message);
      // Code 10 means this build's package and signature aren't registered with Google.
      setError(
        err?.response?.data?.error ??
          (String(err?.code) === '10' || err?.code === 'DEVELOPER_ERROR'
            ? 'Google sign-in isn’t set up for this version of the app. Please use your email.'
            : 'Couldn’t sign in with Google. Please try again or use your email.'),
      );
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.wall} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {POSTERS.map((column, i) => (
          <PosterColumn key={i} posters={column} width={columnWidth} reverse={i === 1} />
        ))}
      </View>
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.55)', '#000']}
        locations={[0, 0.34, 0.62]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Image source={require('@/assets/images/MVV.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Stop scrolling.{'\n'}Start watching.</Text>

          {GOOGLE_ENABLED ? (
            <TouchableOpacity style={styles.primary} onPress={signInWithGoogle} disabled={googleBusy}>
              {googleBusy ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <FontAwesome name="google" size={18} color="#000" />
                  <Text style={styles.primaryText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={[styles.primary, styles.secondary]} onPress={() => router.push('/pages/EmailLoginPage' as any)}>
            <Text style={[styles.primaryText, { color: '#fff' }]}>Continue with email</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}

          <Text style={styles.legal}>
            By continuing you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://movieverse.jefin.xyz/privacy')}>Privacy Policy</Text>.
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  wall: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, opacity: 0.75 },
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 22, paddingBottom: 16 },
  logo: { width: 40, height: 40, borderRadius: 10, marginBottom: 16 },
  title: { color: '#fff', fontSize: 40, fontWeight: '700', lineHeight: 45, letterSpacing: -1.1, marginBottom: 26 },
  primary: { flexDirection: 'row', gap: 10, minHeight: 54, borderRadius: 27, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#000', fontSize: 16, fontWeight: '700' },
  secondary: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', marginTop: 10 },
  error: { color: '#ff8a8a', fontSize: 13.5, lineHeight: 19, marginTop: 12, textAlign: 'center' },
  legal: { color: '#7d7d7d', fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 14 },
  legalLink: { color: '#c4c4c4', textDecorationLine: 'underline' },
});

export default LoginScreen;
