import {
  Avatar,
  BottomBar,
  Button,
  Card,
  CountUp,
  Divider,
  EmptyState,
  Header,
  ListRow,
  ListSkeleton,
  PosterRow,
  ProgressBar,
  Screen,
  SectionHeader,
  Stars,
  Text,
  Thumb,
  gutter,
  space,
  useToast,
} from '@/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';

export default function UserProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [user, setUser] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setFailed(false);
    api
      .get(`api/users/${encodeURIComponent(username)}/`)
      .then((r) => setUser(r.data))
      .catch(() => setFailed(true));
  };
  useEffect(load, [username]);

  const toggleFollow = async () => {
    setBusy(true);
    const path = `api/follow/${encodeURIComponent(username)}/`;
    try {
      if (user.is_following) await api.delete(path);
      else await api.post(path, {});
      setUser((u: any) => ({ ...u, is_following: !u.is_following, followers: u.followers + (u.is_following ? -1 : 1) }));
    } catch {
      toast.show({ title: 'Couldn’t update. Try again.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const openMovie = (id: number) => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: String(id) } } as any);

  return (
    <ProtectedRoute>
      <Screen edges={['top', 'bottom']}>
        <Header back title={String(username)} />
        {failed ? (
          <EmptyState message="Couldn’t load this profile." action={{ label: 'Try again', onPress: load }} />
        ) : !user ? (
          <View style={styles.pad}>
            <ListSkeleton count={4} />
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.body}>
              <View style={styles.identity}>
                <Avatar name={user.username} large />
                <Text variant="label" tone="secondary" style={styles.fill}>
                  {user.followers} followers · {user.following} following
                </Text>
              </View>

              {user.match ? (
                <Card>
                  <Text variant="label" tone="secondary">
                    Taste match
                  </Text>
                  {user.match.score === null ? (
                    <Text style={styles.matchNote}>Not enough ratings to compare yet.</Text>
                  ) : (
                    <>
                      <CountUp value={user.match.score} variant="title" suffix="%" />
                      <ProgressBar value={user.match.score / 100} style={styles.meter} />
                      <Text variant="caption" tone="tertiary">
                        From {user.match.shared} films in common
                      </Text>
                    </>
                  )}
                </Card>
              ) : null}

              {user.both_liked.length ? (
                <View>
                  <SectionHeader title="You both liked" />
                  <PosterRow movies={user.both_liked} onOpen={(m) => openMovie(m.id)} />
                </View>
              ) : null}

              <View>
                <SectionHeader title="Ratings" />
                {user.ratings.length === 0 ? <Text tone="secondary">No ratings yet.</Text> : null}
                {user.ratings.map((r: any, i: number) => (
                  <View key={r.id}>
                    {i > 0 ? <Divider /> : null}
                    <ListRow leading={<Thumb uri={r.poster_url} />} title={r.title} subtitle={<Stars value={r.rating} />} onPress={() => openMovie(r.id)} />
                  </View>
                ))}
              </View>
            </ScrollView>

            {!user.is_me ? (
              <BottomBar>
                <Button
                  variant={user.is_following ? 'secondary' : 'primary'}
                  title={user.is_following ? 'Following' : 'Follow'}
                  icon={user.is_following ? 'check' : 'user-plus'}
                  onPress={toggleFollow}
                  loading={busy}
                />
              </BottomBar>
            ) : null}
          </>
        )}
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: gutter },
  body: { paddingHorizontal: gutter, paddingBottom: space.xxl, gap: space.xxl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  matchNote: { marginTop: space.sm },
  meter: { marginVertical: space.md },
});
