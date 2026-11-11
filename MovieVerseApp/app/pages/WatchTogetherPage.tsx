import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import PageHeader from '../components/PageHeader';
import { s } from '../services/ui';

export default function WatchTogetherPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const enter = (roomCode: string) => router.replace({ pathname: '/pages/RoomPage', params: { code: roomCode } } as any);

  const run = async (request: () => Promise<any>) => {
    setBusy(true);
    try {
      const { data } = await request();
      enter(data.code);
    } catch (err: any) {
      Alert.alert('Watch Together', err?.response?.data?.error ?? 'You need a connection for this. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={s.page}>
        <PageHeader title="Watch Together" />
        <View style={{ padding: 20, flex: 1 }}>
          <View style={[s.iconCircle, { width: 64, height: 64, borderRadius: 32, marginBottom: 18 }]}>
            <Feather name="users" size={28} color="#000" />
          </View>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '700', lineHeight: 32, marginBottom: 28 }}>Can’t agree on a movie?</Text>

          <TouchableOpacity style={s.button} disabled={busy} onPress={() => run(() => api.post('api/rooms/', {}))}>
            {busy ? <ActivityIndicator color="#000" /> : <Text style={s.buttonText}>Start a room</Text>}
          </TouchableOpacity>

          <Text style={[s.meta, { textAlign: 'center', marginVertical: 22 }]}>or join a friend’s</Text>

          <TextInput
            style={[s.input, { textAlign: 'center', fontSize: 22, letterSpacing: 6, fontWeight: '700' }]}
            placeholder="CODE"
            placeholderTextColor="#555"
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[s.button, s.buttonGhost, { marginTop: 12, opacity: code.length === 6 ? 1 : 0.5 }]}
            disabled={busy || code.length !== 6}
            onPress={() => run(() => api.post(`api/rooms/${code}/join/`, {}))}
          >
            <Text style={[s.buttonText, s.buttonGhostText]}>Join room</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
}
