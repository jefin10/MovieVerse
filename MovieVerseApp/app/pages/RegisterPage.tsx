import { BottomBar, Button, Field, Header, Screen, color, gutter, icon , Icon } from '@/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
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
      setError(err?.response?.data?.error ?? 'No connection. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const problem =
    error ||
    (username && !valid ? 'Use 3 to 30 letters, numbers, dots or underscores' : available === false ? 'That username is taken' : '');
  const canSubmit = valid && available !== false && !checking;

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header back onBack={() => router.replace('/pages/LoginPage')} title="Choose a username" />
        <View style={styles.body}>
          <Field
            label="Username"
            leadingIcon="at-sign"
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setError('');
            }}
            error={problem}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={() => canSubmit && submit()}
            trailing={
              checking ? (
                <ActivityIndicator size="small" color={color.textSecondary} />
              ) : available === true ? (
                <Icon name="check" size={icon.inline} color={color.text} accessibilityLabel="Available" />
              ) : null
            }
          />
        </View>
        <BottomBar>
          <Button title="Continue" onPress={submit} loading={busy} disabled={!canSubmit} />
        </BottomBar>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1, paddingHorizontal: gutter },
});

export default RegisterScreen;
