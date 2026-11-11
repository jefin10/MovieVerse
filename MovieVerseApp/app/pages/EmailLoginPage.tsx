import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../auth/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email sign-in: enter an address, get a one-time code, then VerifyOtpPage. */
const EmailLoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Coming back from "Change email" keeps the address that was typed.
  useEffect(() => {
    AsyncStorage.getItem('pendingEmail').then((e) => e && setEmail(e));
  }, []);

  const sendCode = async () => {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await api.post('api/auth/send-otp/', { email: trimmed });
      await AsyncStorage.setItem('pendingEmail', trimmed);
      router.push('/pages/VerifyOtpPage');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No connection. Check your internet and try again.');
    } finally {
      setSending(false);
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/pages/LoginPage'));

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.back} onPress={goBack} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Continue with email</Text>

        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor="#777"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError('');
          }}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="send"
          autoFocus
          onSubmitEditing={sendCode}
          accessibilityLabel="Email address"
        />

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.primary} onPress={sendCode} disabled={sending}>
          {sending ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryText}>Email me a code</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', paddingHorizontal: 22 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 26 },
  title: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  input: {
    height: 54,
    marginTop: 30,
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: '#161616',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
  },
  error: { color: '#ff8a8a', fontSize: 14, lineHeight: 20, marginTop: 12 },
  primary: { minHeight: 54, borderRadius: 27, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

export default EmailLoginPage;
