import { Button, Divider, EmptyState, Header, IconBadge, ListRow, ListSkeleton, Reveal, Screen, Thumb, color, gutter, radius, space } from '@/ui';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import { notificationIcon, useNotifications } from '../components/NotificationCenter';
import { routeForNotification } from '../services/push';
import { timeAgo } from '../services/ui';

export default function NotificationsPage() {
  const router = useRouter();
  const { refresh } = useNotifications();
  const [items, setItems] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('api/notifications/');
      setItems(data.items);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const open = (item: any) => {
    if (!item.read) api.post('api/notifications/read/', { id: item.id }).then(refresh).catch(() => {});
    setItems((list) => list?.map((n) => (n.id === item.id ? { ...n, read: true } : n)) ?? null);
    router.push(routeForNotification(item.data) as any);
  };

  const readAll = async () => {
    setItems((list) => list?.map((n) => ({ ...n, read: true })) ?? null);
    await api.post('api/notifications/read/', {}).catch(() => {});
    refresh();
  };

  const hasUnread = items?.some((n) => !n.read);

  return (
    <ProtectedRoute>
      <Screen edges={['top', 'bottom']}>
        <Header back title="Notifications" actions={hasUnread ? <Button variant="text" title="Read all" onPress={readAll} /> : null} />
        {failed && !items ? (
          <EmptyState message="Notifications need a connection." action={{ label: 'Try again', onPress: load }} />
        ) : !items ? (
          <View style={styles.pad}>
            <ListSkeleton avatar />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(n) => String(n.id)}
            contentContainerStyle={items.length ? styles.list : styles.fill}
            ItemSeparatorComponent={Divider}
            ListEmptyComponent={<EmptyState message="No notifications yet." />}
            renderItem={({ item, index }) => (
              <Reveal index={index}>
                <ListRow
                  leading={item.image_url ? <Thumb uri={item.image_url} /> : <IconBadge name={notificationIcon(item.type)} />}
                  title={item.title}
                  subtitle={item.body}
                  meta={timeAgo(item.at)}
                  emphasis={!item.read}
                  trailing={!item.read ? <View style={styles.dot} accessibilityLabel="Unread" /> : null}
                  onPress={() => open(item)}
                />
              </Reveal>
            )}
          />
        )}
      </Screen>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  fill: { flexGrow: 1 },
  pad: { paddingHorizontal: gutter },
  list: { paddingHorizontal: gutter, paddingBottom: space.xxl },
  dot: { width: space.sm, height: space.sm, borderRadius: radius.control, backgroundColor: color.text },
});
