import {
  Avatar,
  Card,
  ConfirmSheet,
  CountUp,
  Divider,
  Header,
  IconBadge,
  Line,
  ListRow,
  PosterRow,
  PosterRowSkeleton,
  Reveal,
  Screen,
  SectionHeader,
  Text,
  Touchable,
  color,
  gutter,
  hairline,
  size,
  space,
  type IconName,
} from '@/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import { useNotifications } from '../components/NotificationCenter';
import { getWatchlist } from '../services/movieData';

type Stats = { watchlist: number; ratings: number; followers: number; following: number };

const Stat = ({ value, label, onPress }: { value: number | null; label: string; onPress: () => void }) => (
  <Touchable onPress={onPress} accessibilityRole="button" accessibilityLabel={value === null ? label : `${value} ${label}`} style={styles.stat}>
    {value === null ? <Line width={space.xl} variant="section" /> : <CountUp value={value} variant="section" bold />}
    <Text variant="caption" tone="secondary" numberOfLines={1}>
      {label}
    </Text>
  </Touchable>
);

const Profile = () => {
  const router = useRouter();
  const { unread } = useNotifications();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [rated, setRated] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async (forceRefresh = false) => {
    const name = await AsyncStorage.getItem('username');
    if (!name) return;
    setUsername(name);
    const [me, list] = await Promise.all([
      api
        .get(`api/users/${encodeURIComponent(name)}/`)
        .then((r) => r.data)
        .catch(() => null),
      getWatchlist(name, { forceRefresh }).catch(() => []),
      api
        .get('api/auth/getEmail/')
        .then((r) => setEmail(r.data.email))
        .catch(() => {}),
    ]);
    setStats({
      watchlist: list.length,
      ratings: me?.ratings?.length ?? 0,
      followers: me?.followers ?? 0,
      following: me?.following ?? 0,
    });
    setRated(me?.ratings ?? []);
  }, []);

  // Counts change on other tabs, so refresh whenever Profile comes back into view.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const links: { icon: IconName; title: string; route: string; count?: number }[] = [
    { icon: 'users', title: 'Friends', route: '/pages/FriendsPage' },
    { icon: 'film', title: 'Watch together', route: '/pages/WatchTogetherPage' },
    { icon: 'bell', title: 'Notifications', route: '/pages/NotificationsPage', count: unread },
    { icon: 'tv', title: 'Services and alerts', route: '/pages/PreferencesPage' },
  ];

  return (
    <ProtectedRoute>
      <Screen>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.text} colors={[color.inverse]} progressBackgroundColor={color.text} />
          }
        >
          <Header title="Profile" />
          <View style={styles.body}>
            <Reveal style={styles.identity}>
              <Avatar name={username || '?'} large />
              <View style={styles.identityText}>
                <Text variant="section" numberOfLines={1}>
                  {username}
                </Text>
                {email ? (
                  <Text variant="label" tone="secondary" numberOfLines={1}>
                    {email}
                  </Text>
                ) : null}
              </View>
            </Reveal>

            <Card style={styles.stats}>
              <Stat value={stats?.watchlist ?? null} label="Watchlist" onPress={() => router.push('/(tabs)/watchlist')} />
              <View style={styles.statDivider} />
              <Stat value={stats?.ratings ?? null} label="Ratings" onPress={() => router.push('/(tabs)/tinder')} />
              <View style={styles.statDivider} />
              <Stat value={stats?.followers ?? null} label="Followers" onPress={() => router.push('/pages/FriendsPage' as any)} />
              <View style={styles.statDivider} />
              <Stat value={stats?.following ?? null} label="Following" onPress={() => router.push('/pages/FriendsPage' as any)} />
            </Card>

            <View>
              <SectionHeader title="Recently rated" />
              {rated === null ? (
                <PosterRowSkeleton />
              ) : rated.length ? (
                <PosterRow movies={rated} onOpen={(m) => router.push({ pathname: '/pages/MovieDetailPage', params: { movieId: m.id } })} />
              ) : (
                <Text tone="secondary">Films you rate show up here.</Text>
              )}
            </View>

            <View>
              {links.map((link, i) => (
                <View key={link.route}>
                  {i > 0 ? <Divider /> : null}
                  <ListRow
                    leading={<IconBadge name={link.icon} />}
                    title={link.title}
                    trailing={
                      link.count ? (
                        <Text variant="label" tone="secondary">
                          {link.count}
                        </Text>
                      ) : null
                    }
                    chevron
                    onPress={() => router.push(link.route as any)}
                  />
                </View>
              ))}
              <Divider />
              <ListRow leading={<IconBadge name="log-out" tone="danger" />} title="Sign out" destructive onPress={() => setConfirming(true)} />
            </View>
          </View>
        </ScrollView>

        <ConfirmSheet
          visible={confirming}
          title="Sign out of MovieVerse?"
          confirmLabel="Sign out"
          onConfirm={() => router.replace('/pages/LogoutPage')}
          onClose={() => setConfirming(false)}
        />
      </Screen>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: space.xxl },
  body: { paddingHorizontal: gutter, gap: space.xxl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  identityText: { flex: 1, gap: space.xs },
  stats: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 },
  stat: { flex: 1, alignItems: 'center', gap: space.xs, minHeight: size.iconButton, justifyContent: 'center' },
  statDivider: { width: hairline, alignSelf: 'stretch', backgroundColor: color.divider },
});

export default Profile;
