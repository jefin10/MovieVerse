import { useToast } from '@/ui';
import { type IconName } from '@/ui';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import api from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { registerOnLaunch, routeForNotification } from '../services/push';

const POLL_MS = 60_000;

const NotificationContext = createContext<{ unread: number; refresh: () => void }>({ unread: 0, refresh: () => {} });
export const useNotifications = () => useContext(NotificationContext);

const ICONS: Record<string, IconName> = {
  daily_pick: 'moon',
  provider: 'play-circle',
  follow: 'user-plus',
  room_match: 'heart',
};
export const notificationIcon = (type: string) => ICONS[type] ?? 'bell';

/** Keeps the bell's count current and shows anything new as the app's toast. */
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const toast = useToast();
  const { authenticated } = useAuth();
  const [unread, setUnread] = useState(0);
  const lastSeenId = useRef<number | null>(null);

  const open = useCallback(
    (item: any) => {
      api.post('api/notifications/read/', { id: item.id }).catch(() => {});
      router.push(routeForNotification(item.data) as any);
    },
    [router],
  );

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('api/notifications/');
      setUnread(data.unread);
      const newest = data.items[0];
      // The first load is just catching up; only later arrivals are news.
      if (newest && lastSeenId.current !== null && newest.id > lastSeenId.current && !newest.read) {
        toast.show({ title: newest.title, body: newest.body, icon: notificationIcon(newest.type), onPress: () => open(newest) });
      }
      lastSeenId.current = newest?.id ?? 0;
    } catch {
      // Offline: the count just stays as it was.
    }
  }, [toast, open]);

  useEffect(() => {
    if (!authenticated) {
      lastSeenId.current = null;
      setUnread(0);
      return;
    }
    registerOnLaunch();
    refresh();
    const poll = setInterval(refresh, POLL_MS);
    const appState = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    const received = Notifications.addNotificationReceivedListener(() => refresh());
    return () => {
      clearInterval(poll);
      appState.remove();
      received.remove();
    };
  }, [authenticated, refresh]);

  // Tapping a system notification, including one that launched the app.
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledResponse = useRef<string | null>(null);
  useEffect(() => {
    if (!authenticated || !lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    if (handledResponse.current === id) return;
    handledResponse.current = id;
    const data = lastResponse.notification.request.content.data;
    if (data?.notificationId) api.post('api/notifications/read/', { id: data.notificationId }).catch(() => {});
    router.push(routeForNotification(data) as any);
  }, [authenticated, lastResponse, router]);

  return <NotificationContext.Provider value={{ unread, refresh }}>{children}</NotificationContext.Provider>;
};
