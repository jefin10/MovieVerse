import { Avatar, Divider, EmptyState, Field, Header, ListRow, ListSkeleton, Reveal, Screen, SectionHeader, Stars, Text, Thumb, gutter, space } from '@/ui';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import { timeAgo } from '../services/ui';

export default function FriendsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const load = useCallback(() => {
    api
      .get('api/friends/')
      .then((r) => {
        setData(r.data);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, []);
  useFocusEffect(useCallback(() => load(), [load]));

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api
        .get('api/users/', { params: { q: query.trim() } })
        .then((r) => setResults(r.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const openUser = (username: string) => router.push({ pathname: '/pages/UserProfilePage', params: { username } } as any);
  const searching = query.trim().length >= 2;

  return (
    <ProtectedRoute>
      <Screen edges={['top', 'bottom']}>
        <Header back title="Friends" />
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Field
            leadingIcon="search"
            placeholder="Search by username"
            accessibilityLabel="Search people"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searching ? (
            results.length ? (
              <View>
                {results.map((u, i) => (
                  <View key={u.username}>
                    {i > 0 ? <Divider /> : null}
                    <ListRow
                      leading={<Avatar name={u.username} />}
                      title={u.username}
                      trailing={u.is_following ? <Text variant="label" tone="secondary">Following</Text> : null}
                      chevron
                      onPress={() => openUser(u.username)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text tone="secondary">No one by that name.</Text>
            )
          ) : failed && !data ? (
            <EmptyState message="Friends need a connection." action={{ label: 'Try again', onPress: load }} />
          ) : !data ? (
            <ListSkeleton avatar count={4} />
          ) : (
            <>
              <View>
                <SectionHeader title="Following" />
                {data.following.length === 0 ? <Text tone="secondary">Follow people to compare taste.</Text> : null}
                {data.following.map((f: any, i: number) => (
                  <Reveal key={f.username} index={i}>
                    {i > 0 ? <Divider /> : null}
                    <ListRow
                      leading={<Avatar name={f.username} />}
                      title={f.username}
                      subtitle={`${f.shared} in common`}
                      trailing={<Text bold>{f.score === null ? '–' : `${f.score}%`}</Text>}
                      onPress={() => openUser(f.username)}
                    />
                  </Reveal>
                ))}
              </View>

              {data.activity.length ? (
                <View>
                  <SectionHeader title="Recent ratings" />
                  {data.activity.map((a: any, i: number) => (
                    <View key={`${a.username}-${a.movie_id}`}>
                      {i > 0 ? <Divider /> : null}
                      <ListRow
                        leading={<Thumb uri={a.poster_url} />}
                        title={a.title}
                        subtitle={<Stars value={a.rating} label={`${a.username} gave it ${Math.round(a.rating)} out of 5`} />}
                        meta={`${a.username} · ${timeAgo(a.at)}`}
                        onPress={() => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: String(a.movie_id) } } as any)}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: gutter, paddingBottom: space.xxl, gap: space.xxl },
});
