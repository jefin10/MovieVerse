import { useDockSpace } from '@/components/DockTabBar';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import Image from '../components/CachedImage';
import PageHeader from '../components/PageHeader';
import { s, timeAgo } from '../services/ui';

const Avatar = ({ name }: { name: string }) => (
  <View style={s.avatar}><Text style={s.avatarText}>{name[0]?.toUpperCase()}</Text></View>
);

export default function FriendsPage() {
  const dockSpace = useDockSpace();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const load = useCallback(() => {
    api.get('api/friends/').then((r) => { setData(r.data); setFailed(false); }).catch(() => setFailed(true));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      api.get('api/users/', { params: { q: query.trim() } }).then((r) => setResults(r.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const openUser = (username: string) => router.push({ pathname: '/pages/UserProfilePage', params: { username } } as any);

  return (
    <ProtectedRoute>
      <SafeAreaView style={s.page} edges={['top']}>
        <PageHeader title="Friends" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: dockSpace }} keyboardShouldPersistTaps="handled">
          <TextInput
            style={s.input}
            placeholder="Find people by username"
            placeholderTextColor="#777"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {results.length ? (
            <View style={{ marginTop: 10 }}>
              {results.map((u) => (
                <TouchableOpacity key={u.username} style={[s.card, s.rowCard]} onPress={() => openUser(u.username)}>
                  <Avatar name={u.username} />
                  <Text style={[s.cardTitle, { flex: 1 }]}>{u.username}</Text>
                  {u.is_following ? <Text style={s.meta}>Following</Text> : <Feather name="chevron-right" size={18} color="#777" />}
                </TouchableOpacity>
              ))}
            </View>
          ) : query.trim().length >= 2 ? (
            <Text style={[s.meta, { marginTop: 10 }]}>No one by that name.</Text>
          ) : null}

          {failed && !data ? (
            <Text style={s.empty}>Connect to the internet to see your friends.</Text>
          ) : !data ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
          ) : (
            <>
              <Text style={s.sectionTitle}>Following ({data.following.length})</Text>
              {data.following.length === 0 ? (
                <Text style={s.cardBody}>Follow friends to see how your taste compares and what they rate.</Text>
              ) : null}
              {data.following.map((f: any) => (
                <TouchableOpacity key={f.username} style={[s.card, s.rowCard]} onPress={() => openUser(f.username)}>
                  <Avatar name={f.username} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{f.username}</Text>
                    <Text style={s.meta}>{f.shared} movies in common</Text>
                  </View>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{f.score === null ? '–' : `${f.score}%`}</Text>
                </TouchableOpacity>
              ))}

              {data.activity.length ? <Text style={s.sectionTitle}>Recent ratings</Text> : null}
              {data.activity.map((a: any) => (
                <TouchableOpacity
                  key={`${a.username}-${a.movie_id}`}
                  style={[s.card, s.rowCard]}
                  onPress={() => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: String(a.movie_id) } } as any)}
                >
                  <Image source={{ uri: a.poster_url }} style={s.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle} numberOfLines={1}>{a.title}</Text>
                    <Text style={s.cardBody}>{a.username} gave it {'★'.repeat(Math.round(a.rating))}</Text>
                    <Text style={s.meta}>{timeAgo(a.at)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
}
