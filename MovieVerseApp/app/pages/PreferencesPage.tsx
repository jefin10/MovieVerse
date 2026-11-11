import { useDockSpace } from '@/components/DockTabBar';
import { Card, Divider, Header, IconBadge, ListRow, Screen, SectionHeader, Text, Touchable, color, gutter, radius, space, type IconName } from '@/ui';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import Image from '../components/CachedImage';

const REGION_NAMES: Record<string, string> = { IN: 'India', US: 'United States', GB: 'United Kingdom' };

const ALERTS: { key: string; title: string; icon: IconName }[] = [
  { key: 'daily_pick', title: 'Tonight’s pick', icon: 'moon' },
  { key: 'provider_alerts', title: 'Streaming alerts', icon: 'tv' },
  { key: 'social_alerts', title: 'Friends', icon: 'users' },
];

export default function PreferencesPage() {
  const dockSpace = useDockSpace();
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
      <Screen>
        <ScrollView contentContainerStyle={{ paddingBottom: dockSpace }} showsVerticalScrollIndicator={false}>
          <Header back title="Settings" />
          <View style={styles.body}>
            {failed ? (
              <Text tone="secondary">Connect to the internet to change these settings.</Text>
            ) : !prefs ? (
              <ActivityIndicator color={color.text} style={{ marginTop: space.xl }} />
            ) : (
              <>
                <View>
                  <SectionHeader title="Notifications" />
                  {ALERTS.map((a, i) => (
                    <View key={a.key}>
                      {i > 0 ? <Divider /> : null}
                      <ListRow
                        leading={<IconBadge name={a.icon} />}
                        title={a.title}
                        trailing={
                          <Switch
                            value={!!prefs[a.key]}
                            onValueChange={(v) => save({ [a.key]: v })}
                            trackColor={{ true: '#fff', false: '#333' }}
                            thumbColor={prefs[a.key] ? '#000' : '#999'}
                            accessibilityLabel={a.title}
                          />
                        }
                      />
                    </View>
                  ))}
                </View>

                <View>
                  <SectionHeader title="Country" />
                  <View style={styles.wrap}>
                    {prefs.regions.map((r: string) => {
                      const on = prefs.region === r;
                      return (
                        <Touchable
                          key={r}
                          onPress={() => save({ region: r })}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: on }}
                          style={[styles.pill, on && styles.pillOn]}
                        >
                          <Text variant="label" bold style={{ color: on ? '#000' : color.text }}>
                            {REGION_NAMES[r] ?? r}
                          </Text>
                        </Touchable>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <SectionHeader title="Services you pay for" />
                  {providers.length === 0 ? <Text tone="secondary">Streaming services aren’t available yet.</Text> : null}
                  <View style={styles.wrap}>
                    {providers.map((p) => {
                      const on = prefs.providers.includes(p.id);
                      return (
                        <Touchable
                          key={p.id}
                          onPress={() => toggleProvider(p.id)}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: on }}
                          style={[styles.provider, on && styles.providerOn]}
                        >
                          {p.logo_url ? <Image source={{ uri: p.logo_url }} style={styles.logo} /> : null}
                          <Text variant="label" numberOfLines={1} style={{ color: on ? '#000' : color.text }}>
                            {p.name}
                          </Text>
                        </Touchable>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: gutter, gap: space.xxl },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  pill: { paddingVertical: space.sm, paddingHorizontal: space.lg, borderRadius: 999, backgroundColor: color.surface },
  pillOn: { backgroundColor: '#fff' },
  provider: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: 7, paddingRight: space.md, borderRadius: radius.container, backgroundColor: color.surface },
  providerOn: { backgroundColor: '#fff' },
  logo: { width: 28, height: 28, borderRadius: 7 },
});
