import { BottomBar, Button, Field, Header, Screen, gutter, useToast } from '@/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import api, { saveAuthToken } from '../auth/api';
import { useAuth } from '../auth/AuthContext';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

const VerifyOtpPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { setAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);
  const input = useRef<TextInput>(null);

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
      setError(err?.response?.data?.error ?? 'No connection. Try again.');
      setCode('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      input.current?.focus();
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
    setError('');
    try {
      await api.post('api/auth/send-otp/', { email });
      setTimeLeft(RESEND_SECONDS);
      toast.show({ title: 'New code sent', icon: 'mail' });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Couldn’t send a new code. Try again.');
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header back onBack={() => router.replace('/pages/LoginPage')} title="Check your email" />
        <View style={styles.body}>
          <Field
            ref={input}
            label={email ? `Code sent to ${email}` : 'Code'}
            placeholder="6-digit code"
            value={code}
            onChangeText={onChange}
            error={error}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={CODE_LENGTH}
            autoFocus
            disabled={busy}
          />
        </View>
        <BottomBar>
          <Button title="Verify" onPress={() => verify(code)} loading={busy} disabled={code.length !== CODE_LENGTH} />
          <Button
            variant="text"
            title={timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend code'}
            onPress={resend}
            disabled={timeLeft > 0}
          />
        </BottomBar>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1, paddingHorizontal: gutter },
});

export default VerifyOtpPage;
