import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';
import Image from '../components/CachedImage';
import { notificationIcon, useNotifications } from '../components/NotificationCenter';
import PageHeader from '../components/PageHeader';
import { routeForNotification } from '../services/push';
import { s, timeAgo } from '../services/ui';

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

  useFocusEffect(useCallback(() => { load(); }, [load]));

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

  return (
    <ProtectedRoute>
      <SafeAreaView style={s.page}>
        <PageHeader
          title="Notifications"
          right={
            items?.some((n) => !n.read) ? (
              <TouchableOpacity onPress={readAll}><Text style={s.link}>Mark all read</Text></TouchableOpacity>
            ) : null
          }
        />
        {failed && !items ? (
          <Text style={s.empty}>Connect to the internet to see your notifications.</Text>
        ) : !items ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(n) => String(n.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            ListEmptyComponent={<Text style={s.empty}>Nothing yet. Your first pick arrives this evening.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity style={[s.card, s.rowCard, !item.read && s.cardUnread]} onPress={() => open(item)}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={s.thumb} />
                ) : (
                  <View style={s.iconCircle}><Feather name={notificationIcon(item.type)} size={19} color="#000" /></View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.cardBody}>{item.body}</Text>
                  <Text style={s.meta}>{timeAgo(item.at)}</Text>
                </View>
                {!item.read ? <View style={s.dot} /> : null}
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
}
