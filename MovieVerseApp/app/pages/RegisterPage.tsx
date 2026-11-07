import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { saveAuthToken } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { ONBOARDING_KEY } from '../services/push';

const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{3,30}$/;

// Last step for a new account: they've proved who they are, and only need a name.
const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { setAuthenticated } = useAuth();
  const router = useRouter();

  const valid = USERNAME_PATTERN.test(username);

  useEffect(() => {
    AsyncStorage.getItem('suggestedUsername').then((s) => s && setUsername(s));
  }, []);

  useEffect(() => {
    setAvailable(null);
    if (!valid) return;
    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('api/auth/check-username/', { params: { username } });
        setAvailable(data.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      setChecking(false);
    };
  }, [username, valid]);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const signupToken = await AsyncStorage.getItem('signupToken');
      const { data } = await api.post('api/auth/complete-signup/', { username, signup_token: signupToken });
      await saveAuthToken(data.token);
      await AsyncStorage.setItem('username', data.username ?? username);
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      await AsyncStorage.multiRemove(['signupToken', 'pendingEmail', 'suggestedUsername']);
      setAuthenticated(true);
      router.replace('/pages/OnboardingPage');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No connection. Check your internet and try again.');
    } finally {
      setBusy(false);
    }
  };

  const hint =
    username && !valid
      ? 'Use 3-30 letters, numbers, dots or underscores.'
      : available === false
        ? 'That one’s taken. Try another.'
        : '';

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.back} onPress={() => router.replace('/pages/LoginPage')} accessibilityLabel="Start over">
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Pick a username</Text>
        <Text style={styles.sub}>It’s how friends find you. Your email stays private.</Text>

        <View style={[styles.field, !!hint && styles.fieldBad, available === true && styles.fieldGood]}>
          <Text style={styles.at}>@</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={() => valid && available !== false && submit()}
          />
          {checking ? <ActivityIndicator size="small" color="#888" /> : null}
          {!checking && available === true ? <Feather name="check-circle" size={20} color="#fff" /> : null}
        </View>
        <Text style={styles.hint} accessibilityLiveRegion="polite">{error || hint}</Text>

        <TouchableOpacity
          style={[styles.primary, (!valid || available === false || busy) && styles.primaryOff]}
          disabled={!valid || available === false || busy}
          onPress={submit}
        >
          {busy ? <ActivityIndicator color="#000" /> : <Text style={[styles.primaryText, (!valid || available === false) && { color: '#8a8a8a' }]}>Continue</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', paddingHorizontal: 22 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 26 },
  title: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  sub: { color: '#a3a3a3', fontSize: 15, lineHeight: 22, marginTop: 8 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 28, paddingHorizontal: 16, height: 58, borderRadius: 16, backgroundColor: '#161616', borderWidth: 1.5, borderColor: '#2a2a2a' },
  fieldGood: { borderColor: '#fff' },
  fieldBad: { borderColor: '#ff6b6b' },
  at: { color: '#777', fontSize: 18 },
  input: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 0 },
  hint: { color: '#ff8a8a', fontSize: 13, lineHeight: 18, minHeight: 34, marginTop: 8 },
  primary: { minHeight: 54, borderRadius: 27, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  primaryOff: { backgroundColor: '#222' },
  primaryText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

export default RegisterScreen;
