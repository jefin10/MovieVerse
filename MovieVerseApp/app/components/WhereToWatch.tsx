import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchWithCache } from '../services/cache';
import api from '../auth/api';
import Image from './CachedImage';

const DAY_MS = 24 * 60 * 60 * 1000;

const Row = ({ label, items }: { label: string; items: any[] }) =>
  items.length ? (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.logos}>
        {items.map((p) => (
          <View key={p.id} style={[styles.provider, p.mine && styles.providerMine]}>
            {p.logo_url ? <Image source={{ uri: p.logo_url }} style={styles.logo} /> : null}
            <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
          </View>
        ))}
      </View>
    </View>
  ) : null;

const WhereToWatch = ({ movieId }: { movieId: number }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchWithCache({
      key: `movie:${movieId}:providers`,
      ttlMs: DAY_MS,
      fetcher: async () => (await api.get(`api/movie/${movieId}/providers/`)).data,
    })
      .then(setData)
      .catch(() => setData(null));
  }, [movieId]);

  // Nothing to say until streaming data is set up on the server.
  if (!data?.available) return null;
  const empty = !data.stream.length && !data.rent.length && !data.buy.length;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Where to watch</Text>
      {empty ? <Text style={styles.empty}>Not available to stream in your country right now.</Text> : null}
      <Row label="Stream" items={data.stream} />
      <Row label="Rent" items={data.rent} />
      <Row label="Buy" items={data.buy} />
      {data.link ? (
        <TouchableOpacity onPress={() => Linking.openURL(data.link)}>
          <Text style={styles.link}>See all options</Text>
        </TouchableOpacity>
      ) : null}
      {empty ? null : <Text style={styles.credit}>Availability data from JustWatch</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { marginBottom: 12 },
  label: { color: '#999', fontSize: 12, fontWeight: '600', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.8 },
  logos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  provider: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 5, paddingLeft: 5, paddingRight: 10, borderRadius: 11, backgroundColor: '#1a1a1a', maxWidth: 190 },
  providerMine: { borderWidth: 1, borderColor: '#fff' },
  logo: { width: 26, height: 26, borderRadius: 7 },
  name: { color: '#fff', fontSize: 13, flexShrink: 1 },
  empty: { color: '#999', fontSize: 14, lineHeight: 20 },
  link: { color: '#fff', fontSize: 13, textDecorationLine: 'underline', marginTop: 2 },
  credit: { color: '#666', fontSize: 11, marginTop: 8 },
});

export default WhereToWatch;
