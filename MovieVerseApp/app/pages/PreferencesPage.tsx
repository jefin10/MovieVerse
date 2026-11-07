import { Chip, Divider, EmptyState, Header, ListRow, ListSkeleton, Screen, SectionHeader, SegmentedControl, Text, color, gutter, space, useToast } from '@/ui';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';

const REGION_NAMES: Record<string, string> = { IN: 'India', US: 'US', GB: 'UK' };

const ALERTS = [
  { key: 'daily_pick', title: 'Tonight’s pick' },
  { key: 'provider_alerts', title: 'Streaming alerts' },
  { key: 'social_alerts', title: 'New followers' },
];

export default function PreferencesPage() {
  const toast = useToast();
  const [prefs, setPrefs] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [failed, setFailed] = useState(false);

  const loadProviders = () =>
    api
      .get('api/providers/')
      .then((r) => setProviders(r.data))
      .catch(() => {});

  const load = () => {
    setFailed(false);
    api
      .get('api/preferences/')
      .then((r) => setPrefs(r.data))
      .catch(() => setFailed(true));
    loadProviders();
  };
  useEffect(load, []);

  // Optimistic: the switch moves at once and goes back if the save fails.
  const save = async (patch: Record<string, unknown>) => {
    const previous = prefs;
    setPrefs({ ...prefs, ...patch });
    try {
      const { data } = await api.patch('api/preferences/', patch);
      setPrefs(data);
      if (patch.region) loadProviders();
    } catch {
      setPrefs(previous);
      toast.show({ title: 'Couldn’t save. Try again.', tone: 'error' });
    }
  };

  const toggleProvider = (id: number) =>
    save({ providers: prefs.providers.includes(id) ? prefs.providers.filter((p: number) => p !== id) : [...prefs.providers, id] });

  return (
    <ProtectedRoute>
      <Screen edges={['top', 'bottom']}>
        <Header back title="Services and alerts" />
        {failed ? (
          <EmptyState message="Settings need a connection." action={{ label: 'Try again', onPress: load }} />
        ) : !prefs ? (
          <View style={styles.pad}>
            <ListSkeleton avatar count={3} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <View>
              <SectionHeader title="Notifications" />
              {ALERTS.map((a, i) => (
                <View key={a.key}>
                  {i > 0 ? <Divider /> : null}
                  <ListRow
                    title={a.title}
                    trailing={
                      <Switch
                        value={prefs[a.key]}
                        onValueChange={(v) => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          save({ [a.key]: v });
                        }}
                        trackColor={{ true: color.text, false: color.divider }}
                        thumbColor={prefs[a.key] ? color.inverse : color.textSecondary}
                        accessibilityLabel={a.title}
                      />
                    }
                  />
                </View>
              ))}
            </View>

            <View>
              <SectionHeader title="Country" />
              <SegmentedControl
                value={prefs.region}
                onChange={(region) => save({ region })}
                options={prefs.regions.map((r: string) => ({ value: r, label: REGION_NAMES[r] ?? r }))}
              />
            </View>

            <View>
              <SectionHeader title="Your services" />
              {providers.length === 0 ? <Text tone="secondary">Not available yet.</Text> : null}
              <View style={styles.chips}>
                {providers.map((p) => (
                  <Chip key={p.id} label={p.name} imageUri={p.logo_url} selected={prefs.providers.includes(p.id)} onPress={() => toggleProvider(p.id)} />
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: gutter },
  body: { paddingHorizontal: gutter, paddingBottom: space.xxl, gap: space.xxl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
