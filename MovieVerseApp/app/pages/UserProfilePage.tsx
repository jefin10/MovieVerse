import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import Image from '../components/CachedImage';
import PageHeader from '../components/PageHeader';
import { s } from '../services/ui';

const MatchMeter = ({ score }: { score: number }) => {
  const [width] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(width, { toValue: score, duration: 900, useNativeDriver: false }).start();
  }, [score, width]);
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: '#2a2a2a', marginTop: 12, overflow: 'hidden' }}>
      <Animated.View
        style={{ height: 6, backgroundColor: '#fff', width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }}
      />
    </View>
  );
};

export default function UserProfilePage() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [user, setUser] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`api/users/${encodeURIComponent(username)}/`).then((r) => setUser(r.data)).catch(() => setFailed(true));
  }, [username]);

  const toggleFollow = async () => {
    setBusy(true);
    const path = `api/follow/${encodeURIComponent(username)}/`;
    try {
      if (user.is_following) await api.delete(path);
      else await api.post(path, {});
      setUser((u: any) => ({
        ...u,
        is_following: !u.is_following,
        followers: u.followers + (u.is_following ? -1 : 1),
      }));
    } finally {
      setBusy(false);
    }
  };

  const openMovie = (id: number) => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: String(id) } } as any);

  return (
    <ProtectedRoute>
      <SafeAreaView style={s.page}>
        <PageHeader title={String(username)} />
        {failed ? (
          <Text style={s.empty}>Couldn’t load this profile. Check your connection.</Text>
        ) : !user ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            <View style={[s.rowCard, { marginVertical: 8 }]}>
              <View style={[s.avatar, { width: 64, height: 64, borderRadius: 32 }]}>
                <Text style={[s.avatarText, { fontSize: 26 }]}>{user.username[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardBody}>{user.followers} followers · {user.following} following</Text>
              </View>
              {!user.is_me ? (
                <TouchableOpacity style={[s.pill, user.is_following && s.pillOff]} onPress={toggleFollow} disabled={busy}>
                  <Text style={[s.pillText, user.is_following && s.pillOffText]}>{user.is_following ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {user.match ? (
              <View style={[s.card, { marginTop: 8 }]}>
                {user.match.score === null ? (
                  <>
                    <Text style={s.cardTitle}>Taste match</Text>
                    <Text style={s.cardBody}>Not enough to compare yet. You each need at least 3 swipes or ratings.</Text>
                  </>
                ) : (
                  <>
                    <Text style={{ color: '#fff', fontSize: 40, fontWeight: '300' }}>{user.match.score}%</Text>
                    <Text style={s.cardBody}>taste match with {user.username}, from {user.match.shared} movies in common and your favourite genres</Text>
                    <MatchMeter score={user.match.score} />
                  </>
                )}
              </View>
            ) : null}

            {user.both_liked.length ? <Text style={s.sectionTitle}>You both liked</Text> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {user.both_liked.map((m: any) => (
                <TouchableOpacity key={m.id} style={{ marginRight: 10, width: 100 }} onPress={() => openMovie(m.id)}>
                  <Image source={{ uri: m.poster_url }} style={{ width: 100, height: 150, borderRadius: 10, backgroundColor: '#222' }} />
                  <Text style={[s.meta, { color: '#ddd' }]} numberOfLines={1}>{m.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.sectionTitle}>Ratings</Text>
            {user.ratings.length === 0 ? <Text style={s.cardBody}>{user.username} hasn’t rated anything yet.</Text> : null}
            {user.ratings.map((r: any) => (
              <TouchableOpacity key={r.id} style={[s.card, s.rowCard]} onPress={() => openMovie(r.id)}>
                <Image source={{ uri: r.poster_url }} style={s.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={s.cardBody}>{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
}
