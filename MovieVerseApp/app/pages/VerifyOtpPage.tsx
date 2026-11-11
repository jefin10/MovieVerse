import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { saveAuthToken } from '../auth/api';
import { useAuth } from '../auth/AuthContext';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

const VerifyOtpPage = () => {
  const router = useRouter();
  const { setAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  // One hidden input behind the boxes, so pasting and autofill just work.
  const input = useRef<TextInput>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('pendingEmail').then((stored) => {
      if (stored) setEmail(stored);
      else router.replace('/pages/LoginPage');
    });
  }, [router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const reject = (message: string) => {
    setError(message);
    setCode('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    Animated.sequence(
      [10, -10, 7, -7, 0].map((toValue) => Animated.timing(shake, { toValue, duration: 55, useNativeDriver: true })),
    ).start();
    input.current?.focus();
  };

  const verify = async (value: string) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('api/auth/verify-otp/', { email, otp: value });
      // A new email still needs a username before it has an account.
      if (data.needs_username) {
        await AsyncStorage.multiSet([
          ['signupToken', data.signup_token],
          ['suggestedUsername', data.suggested_username ?? ''],
        ]);
        router.replace('/pages/RegisterPage');
        return;
      }
      await saveAuthToken(data.token);
      await AsyncStorage.setItem('username', data.username);
      await AsyncStorage.removeItem('pendingEmail');
      setAuthenticated(true);
      router.replace('/(tabs)');
    } catch (err: any) {
      reject(err?.response?.data?.error ?? 'No connection. Check your internet and try again.');
    } finally {
      setBusy(false);
    }
  };

  const onChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError('');
    if (digits.length === CODE_LENGTH) verify(digits);
  };

  const resend = async () => {
    setNotice('');
    setError('');
    try {
      await api.post('api/auth/send-otp/', { email });
      setTimeLeft(RESEND_SECONDS);
      setNotice('New code sent.');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Could not send a new code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.back} onPress={() => router.replace('/pages/EmailLoginPage' as any)} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.sub}><Text style={styles.email}>{email}</Text></Text>

        <Pressable onPress={() => input.current?.focus()} accessibilityLabel="Enter your 6-digit code">
          <Animated.View style={[styles.boxes, { transform: [{ translateX: shake }] }]}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const active = i === code.length && !busy;
              return (
                <View key={i} style={[styles.box, active && styles.boxActive, !!code[i] && styles.boxFilled, !!error && styles.boxError]}>
                  <Text style={styles.digit}>{code[i] ?? ''}</Text>
                </View>
              );
            })}
          </Animated.View>
        </Pressable>
        <TextInput
          ref={input}
          style={styles.hiddenInput}
          value={code}
          onChangeText={onChange}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={CODE_LENGTH}
          autoFocus
          caretHidden
          editable={!busy}
        />

        <View style={styles.status}>
          {busy ? <ActivityIndicator color="#fff" /> : null}
          {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
          {notice && !error ? <Text style={styles.notice} accessibilityLiveRegion="polite">{notice}</Text> : null}
        </View>

        <View style={styles.resendRow}>
          {timeLeft > 0 ? (
            <Text style={styles.muted}>Resend code in {timeLeft}s</Text>
          ) : (
            <TouchableOpacity onPress={resend}><Text style={styles.link}>Resend code</Text></TouchableOpacity>
          )}
          <Text style={styles.muted}>  ·  </Text>
          <TouchableOpacity onPress={() => router.replace('/pages/EmailLoginPage' as any)}><Text style={styles.link}>Change email</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', paddingHorizontal: 22 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 26 },
  title: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  sub: { color: '#a3a3a3', fontSize: 15, lineHeight: 22, marginTop: 8 },
  email: { color: '#fff', fontWeight: '600' },
  boxes: { flexDirection: 'row', gap: 8, marginTop: 30 },
  box: { flex: 1, aspectRatio: 0.82, borderRadius: 14, backgroundColor: '#161616', borderWidth: 1.5, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  boxActive: { borderColor: '#fff' },
  boxFilled: { backgroundColor: '#222', borderColor: '#555' },
  boxError: { borderColor: '#ff6b6b' },
  digit: { color: '#fff', fontSize: 26, fontWeight: '600' },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  status: { minHeight: 44, justifyContent: 'center', marginTop: 12 },
  error: { color: '#ff8a8a', fontSize: 14, lineHeight: 20 },
  notice: { color: '#fff', fontSize: 14 },
  resendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  muted: { color: '#8a8a8a', fontSize: 14 },
  link: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default VerifyOtpPage;
