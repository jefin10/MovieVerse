import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import Image from '../components/CachedImage';
import PageHeader from '../components/PageHeader';
import { s } from '../services/ui';

const REGION_NAMES: Record<string, string> = { IN: 'India', US: 'United States', GB: 'United Kingdom' };

const ALERTS = [
  { key: 'daily_pick', title: "Tonight's pick", body: 'One movie chosen for you each evening' },
  { key: 'provider_alerts', title: 'Streaming alerts', body: 'When a watchlist movie reaches your services' },
  { key: 'social_alerts', title: 'Friends', body: 'When someone follows you' },
];

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [failed, setFailed] = useState(false);

  const loadProviders = () => api.get('api/providers/').then((r) => setProviders(r.data)).catch(() => {});

  useEffect(() => {
    api.get('api/preferences/').then((r) => setPrefs(r.data)).catch(() => setFailed(true));
    loadProviders();
  }, []);

  const save = async (patch: Record<string, unknown>) => {
    const previous = prefs;
    setPrefs({ ...prefs, ...patch });
    try {
      const { data } = await api.patch('api/preferences/', patch);
      setPrefs(data);
      if (patch.region) loadProviders();
    } catch {
      setPrefs(previous);
    }
  };

  const toggleProvider = (id: number) =>
    save({ providers: prefs.providers.includes(id) ? prefs.providers.filter((p: number) => p !== id) : [...prefs.providers, id] });

  return (
    <ProtectedRoute>
      <SafeAreaView style={s.page}>
        <PageHeader title="Services & alerts" />
        {failed ? (
          <Text style={s.empty}>Connect to the internet to change these settings.</Text>
        ) : !prefs ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            <Text style={s.sectionTitle}>Notifications</Text>
            {ALERTS.map((a) => (
              <View key={a.key} style={[s.card, s.rowCard]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{a.title}</Text>
                  <Text style={s.cardBody}>{a.body}</Text>
                </View>
                <Switch
                  value={prefs[a.key]}
                  onValueChange={(v) => save({ [a.key]: v })}
                  trackColor={{ true: '#fff', false: '#333' }}
                  thumbColor={prefs[a.key] ? '#000' : '#999'}
                />
              </View>
            ))}

            <Text style={s.sectionTitle}>Country</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {prefs.regions.map((r: string) => (
                <TouchableOpacity key={r} style={[s.pill, prefs.region !== r && s.pillOff]} onPress={() => save({ region: r })}>
                  <Text style={[s.pillText, prefs.region !== r && s.pillOffText]}>{REGION_NAMES[r] ?? r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sectionTitle}>Services you pay for</Text>
            {providers.length === 0 ? <Text style={s.cardBody}>Streaming services aren’t available yet.</Text> : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {providers.map((p) => {
                const on = prefs.providers.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => toggleProvider(p.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 7, paddingRight: 12, borderRadius: 13, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: on ? '#fff' : 'transparent' }]}
                  >
                    {p.logo_url ? <Image source={{ uri: p.logo_url }} style={{ width: 28, height: 28, borderRadius: 7 }} /> : null}
                    <Text style={{ color: '#fff', fontSize: 13 }}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
}
