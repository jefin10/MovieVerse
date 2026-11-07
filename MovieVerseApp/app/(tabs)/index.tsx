import {
  Card,
  Chip,
  EmptyState,
  Field,
  Header,
  Icon,
  IconButton,
  PosterRow,
  PosterRowSkeleton,
  Screen,
  SectionHeader,
  Text,
  color,
  gutter,
  icon,
  space,
  type IconName,
  type PosterMovie,
} from '@/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import ProtectedRoute from '../auth/protectedRoute';
import { useNotifications } from '../components/NotificationCenter';
import { getRecommendations, getTrendingMovies, prefetchTabData } from '../services/movieData';

// Same phrases the home mood buttons always sent to the mood model.
const MOODS = [
  { label: 'Happy', query: 'drama' },
  { label: 'Sad', query: 'comedy' },
  { label: 'Love', query: 'Romantic' },
  { label: 'Empty', query: 'action' },
];

const greetingFor = (hour: number) => (hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 18 ? 'Good afternoon' : 'Good evening');

const Shortcut = ({ icon: name, title, caption, onPress }: { icon: IconName; title: string; caption: string; onPress: () => void }) => (
  <Card onPress={onPress} accessibilityLabel={title} style={styles.shortcut}>
    <Icon name={name} size={icon.action} />
    <View style={styles.shortcutText}>
      <Text bold numberOfLines={1}>
        {title}
      </Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {caption}
      </Text>
    </View>
  </Card>
);

const Home = () => {
  const router = useRouter();
  const { authenticated } = useAuth();
  const { unread } = useNotifications();
  const [username, setUsername] = useState('');
  const [forYou, setForYou] = useState<PosterMovie[]>([]);
  const [trending, setTrending] = useState<PosterMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [greeting, setGreeting] = useState(greetingFor(new Date().getHours()));

  const load = async (forceRefresh = false) => {
    const stored = await AsyncStorage.getItem('username');
    if (stored) setUsername(stored);
    await Promise.all([
      getTrendingMovies({ forceRefresh }).then((m) => setTrending(m as PosterMovie[])).catch(() => {}),
      stored ? getRecommendations(stored, { forceRefresh }).then((m) => setForYou(m as PosterMovie[])).catch(() => {}) : null,
    ]);
    if (stored && !forceRefresh) void prefetchTabData(stored);
  };

  useEffect(() => {
    if (authenticated !== true) {
      if (authenticated === false) setLoading(false);
      return;
    }
    load().finally(() => setLoading(false));
    const timer = setInterval(() => setGreeting(greetingFor(new Date().getHours())), 60000);
    return () => clearInterval(timer);
  }, [authenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const open = (movie: PosterMovie) => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: movie.id } });
  const pickMood = (query: string) => router.push({ pathname: '/(tabs)/mood', params: { selectedMood: query } });
  const submitSearch = () => {
    if (search.trim()) router.push({ pathname: '/pages/SearchResults', params: { query: search.trim() } });
  };

  return (
    <ProtectedRoute>
      <Screen>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.text} colors={[color.inverse]} progressBackgroundColor={color.text} />
          }
        >
          <Header
            title={username ? `${greeting}, ${username}` : greeting}
            actions={<IconButton name="bell" label="Notifications" badge={unread} onPress={() => router.push('/pages/NotificationsPage' as any)} />}
          />
          <View style={styles.body}>
            <Field
              leadingIcon="search"
              placeholder="Search movies"
              accessibilityLabel="Search movies"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={submitSearch}
            />

            <View>
              <SectionHeader title="How are you feeling?" />
              <View style={styles.chips}>
                {MOODS.map((m) => (
                  <Chip key={m.label} role="button" label={m.label} onPress={() => pickMood(m.query)} />
                ))}
                <Chip role="button" label="Something else" onPress={() => router.push('/(tabs)/mood')} />
              </View>
            </View>

            <View style={styles.shortcuts}>
              <Shortcut icon="users" title="Watch together" caption="Swipe with friends" onPress={() => router.push('/pages/WatchTogetherPage' as any)} />
              <Shortcut icon="heart" title="Friends" caption="Your taste match" onPress={() => router.push('/pages/FriendsPage' as any)} />
            </View>

            <View>
              <SectionHeader title="For you" />
              {loading ? (
                <PosterRowSkeleton />
              ) : forYou.length ? (
                <PosterRow movies={forYou} onOpen={open} />
              ) : (
                <EmptyState
                  message="Rate a few films to see picks here."
                  action={{ label: 'Start swiping', onPress: () => router.push('/(tabs)/tinder') }}
                  style={styles.inlineEmpty}
                />
              )}
            </View>

            <View>
              <SectionHeader title="Trending" />
              {loading ? (
                <PosterRowSkeleton />
              ) : trending.length ? (
                <PosterRow movies={trending} onOpen={open} />
              ) : (
                <EmptyState message="Nothing trending right now." style={styles.inlineEmpty} />
              )}
            </View>

            <Card onPress={() => router.push('/(tabs)/tinder')} accessibilityLabel="Free weekend? Swipe to fill your watchlist" style={styles.weekend}>
              <View style={styles.shortcutText}>
                <Text variant="section">Free weekend?</Text>
                <Text variant="label" tone="secondary">
                  Swipe to fill your watchlist
                </Text>
              </View>
              <Icon name="arrow-right" size={icon.action} />
            </Card>
          </View>
        </ScrollView>
      </Screen>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: space.xxl },
  body: { paddingHorizontal: gutter, gap: space.xxl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  shortcuts: { flexDirection: 'row', gap: space.md },
  shortcut: { flex: 1, gap: space.md },
  shortcutText: { flex: 1, gap: space.xs },
  weekend: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  inlineEmpty: { flex: 0, paddingVertical: space.xl },
});

export default Home;
