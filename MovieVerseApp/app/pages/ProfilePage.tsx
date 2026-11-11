import {
  Avatar,
  ConfirmSheet,
  Divider,
  Header,
  IconBadge,
  ListRow,
  PosterRow,
  PosterRowSkeleton,
  Reveal,
  Screen,
  SectionHeader,
  Text,
  color,
  gutter,
  space,
  type IconName,
} from '@/ui';
import { useDockSpace } from '@/components/DockTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import { useNotifications } from '../components/NotificationCenter';

const ProfilePage = () => {
  const router = useRouter();
  const { unread } = useNotifications();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [rated, setRated] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const dockSpace = useDockSpace();

  const load = useCallback(async () => {
    const name = await AsyncStorage.getItem('username');
    if (!name) return;
    setUsername(name);
    const [me] = await Promise.all([
      api
        .get(`api/users/${encodeURIComponent(name)}/`)
        .then((r) => r.data)
        .catch(() => null),
      api
        .get('api/auth/getEmail/')
        .then((r) => setEmail(r.data.email))
        .catch(() => {}),
    ]);
    setRated(me?.ratings ?? []);
  }, []);

  // Ratings change on other tabs, so refresh whenever Profile comes back into view.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const links: { icon: IconName; title: string; route: string; count?: number }[] = [
    { icon: 'users', title: 'Friends', route: '/(tabs)/friends' },
    { icon: 'film', title: 'Watch together', route: '/pages/WatchTogetherPage' },
    { icon: 'bell', title: 'Notifications', route: '/(tabs)/notifications', count: unread },
    { icon: 'settings', title: 'Settings', route: '/(tabs)/settings' },
  ];

  return (
    <ProtectedRoute>
      <Screen>
        <ScrollView
          contentContainerStyle={{ paddingBottom: dockSpace }}
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
  body: { paddingHorizontal: gutter, gap: space.xxl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  identityText: { flex: 1, gap: space.xs },
});

export default ProfilePage;
