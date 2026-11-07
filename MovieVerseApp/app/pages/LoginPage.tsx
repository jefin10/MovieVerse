import { BottomBar, Button, Field, GoogleMark, Reveal, Text, color, gutter, radius, space } from '@/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image as RNImage, KeyboardAvoidingView, Linking, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { saveAuthToken } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import Image from '../components/CachedImage';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const POSTERS = [
  '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', '/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg', '/icmmSD4vTTDKOq2vvdulafOGw93.jpg',
  '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', '/l33oR0mnvf20avWyIMxW02EtQxn.jpg', '/rlay2M5QYvi6igbGcFjq8jxeusY.jpg',
  '/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg', '/mmd1HnuvAzFc4iuVJcnBrhDNEKr.jpg', '/sCzcYW9h55WcesOqA12cgEr9Exw.jpg',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_ENABLED === 'true';
// Only needed with a Web OAuth client. Android clients sign in with an access token.
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

const LoginScreen = () => {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState('');
  const { setAuthenticated } = useAuth();
  const router = useRouter();

  const posterWidth = Math.floor((width - gutter * 2 - space.md * 2) / 3);

  const sendCode = async () => {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('Enter a valid email address');
      return;
    }
    setSending(true);
    setError('');
    try {
      await api.post('api/auth/send-otp/', { email: trimmed });
      await AsyncStorage.setItem('pendingEmail', trimmed);
      router.push('/pages/VerifyOtpPage');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No connection. Try again.');
    } finally {
      setSending(false);
    }
  };

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
            ? 'Google sign-in isn’t available in this version. Use your email.'
            : 'Google sign-in failed. Try again or use your email.'),
      );
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.wall} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {POSTERS.map((p) => (
          <Image key={p} source={{ uri: `${POSTER_BASE}${p}` }} style={[styles.poster, { width: posterWidth, height: posterWidth * 1.5 }]} />
        ))}
      </View>
      <LinearGradient colors={['transparent', color.mediaScrim, color.bg]} locations={[0, 0.3, 0.6]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.content}>
            <Reveal style={styles.copy}>
              <View style={styles.brand}>
                <RNImage source={require('@/assets/images/MVV.png')} style={styles.logo} resizeMode="contain" />
                <Text variant="section">MovieVerse</Text>
              </View>
              <Text variant="title">Stop scrolling. Start watching.</Text>
            </Reveal>
            <Reveal index={1}>
              <Field
                label="Email"
                placeholder="you@email.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError('');
                }}
                error={error}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="send"
                onSubmitEditing={sendCode}
              />
            </Reveal>
          </View>

          <BottomBar>
            <Button title="Continue" onPress={sendCode} loading={sending} disabled={!email.trim()} />
            {GOOGLE_ENABLED ? (
              <Button
                variant="secondary"
                title="Continue with Google"
                onPress={signInWithGoogle} loading={googleBusy}
                leading={<GoogleMark />}
              />
            ) : null}
            <Text variant="caption" tone="tertiary" center>
              By continuing you agree to our{' '}
              <Text variant="caption" tone="secondary" style={styles.link} onPress={() => Linking.openURL('https://movieverse.jefin.xyz/privacy')}>
                Privacy policy
              </Text>
            </Text>
          </BottomBar>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: color.bg, overflow: 'hidden' },
  fill: { flex: 1 },
  wall: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', flexWrap: 'wrap', gap: space.md, padding: gutter, opacity: 0.75 },
  poster: { borderRadius: radius.container, backgroundColor: color.surface },
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: gutter, gap: space.xl },
  copy: { gap: space.lg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logo: { width: space.xxl, height: space.xxl },
  link: { textDecorationLine: 'underline' },
});

export default LoginScreen;
