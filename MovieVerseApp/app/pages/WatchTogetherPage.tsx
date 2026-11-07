import { BottomBar, Button, Field, Header, Screen, Text, gutter, space, useToast } from '@/ui';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';

export default function WatchTogetherPage() {
  const router = useRouter();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [starting, setStarting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const enter = (roomCode: string) => router.replace({ pathname: '/pages/RoomPage', params: { code: roomCode } } as any);

  const start = async () => {
    setStarting(true);
    try {
      const { data } = await api.post('api/rooms/', {});
      enter(data.code);
    } catch (err: any) {
      toast.show({ title: err?.response?.data?.error ?? 'Starting a room needs a connection.', tone: 'error' });
    } finally {
      setStarting(false);
    }
  };

  const join = async () => {
    setJoining(true);
    setJoinError('');
    try {
      const { data } = await api.post(`api/rooms/${code}/join/`, {});
      enter(data.code);
    } catch (err: any) {
      setJoinError(err?.response?.data?.error ?? 'Joining needs a connection.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <ProtectedRoute>
      <Screen edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Header back title="Watch together" />
          <View style={styles.body}>
            <Text tone="secondary">Everyone swipes the same films. You see the ones you all liked.</Text>
            <View style={styles.join}>
              <Field
                label="Room code"
                placeholder="6 characters"
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  setJoinError('');
                }}
                error={joinError}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={() => code.length === 6 && join()}
              />
              <Button variant="secondary" title="Join room" onPress={join} loading={joining} disabled={code.length !== 6} />
            </View>
          </View>
          <BottomBar>
            <Button title="Start a room" onPress={start} loading={starting} />
          </BottomBar>
        </KeyboardAvoidingView>
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1, paddingHorizontal: gutter, gap: space.xxl },
  join: { gap: space.md },
});
