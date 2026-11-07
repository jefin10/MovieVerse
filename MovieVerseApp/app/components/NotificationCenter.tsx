import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { registerOnLaunch, routeForNotification } from '../services/push';
import Image from './CachedImage';

const POLL_MS = 60_000;
const TOAST_MS = 4500;

const NotificationContext = createContext<{ unread: number; refresh: () => void }>({ unread: 0, refresh: () => {} });
export const useNotifications = () => useContext(NotificationContext);

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  daily_pick: 'moon',
  provider: 'play-circle',
  follow: 'user-plus',
  room_match: 'heart',
};
export const notificationIcon = (type: string) => ICONS[type] ?? 'bell';

/** Keeps the bell's count current and slides in a toast for anything new while the app is open. */
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { authenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<any>(null);
  const lastSeenId = useRef<number | null>(null);
  const slide = useRef(new Animated.Value(-160)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hide = useCallback(() => {
    Animated.timing(slide, { toValue: -160, duration: 240, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(() =>
      setToast(null),
    );
  }, [slide]);

  const show = useCallback(
    (item: any) => {
      setToast(item);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Animated.spring(slide, { toValue: 0, damping: 16, stiffness: 170, useNativeDriver: true }).start();
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(hide, TOAST_MS);
    },
    [hide, slide],
  );

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('api/notifications/');
      setUnread(data.unread);
      const newest = data.items[0];
      // The first load is just catching up; only later arrivals are news.
      if (newest && lastSeenId.current !== null && newest.id > lastSeenId.current && !newest.read) show(newest);
      lastSeenId.current = newest?.id ?? 0;
    } catch {
      // Offline: the count just stays as it was.
    }
  }, [show]);

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

  const openToast = () => {
    const item = toast;
    hide();
    api.post('api/notifications/read/', { id: item.id }).then(refresh).catch(() => {});
    router.push(routeForNotification(item.data) as any);
  };

  return (
    <NotificationContext.Provider value={{ unread, refresh }}>
      {children}
      {toast ? (
        <Animated.View style={[styles.toastWrap, { top: insets.top + 8, transform: [{ translateY: slide }] }]}>
          <Pressable style={styles.toast} onPress={openToast} accessibilityRole="button">
            {toast.image_url ? (
              <Image source={{ uri: toast.image_url }} style={styles.toastPoster} />
            ) : (
              <View style={styles.toastIcon}>
                <Feather name={notificationIcon(toast.type)} size={20} color="#000" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle} numberOfLines={1}>{toast.title}</Text>
              <Text style={styles.toastBody} numberOfLines={2}>{toast.body}</Text>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastWrap: { position: 'absolute', left: 12, right: 12, zIndex: 100, elevation: 20 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(28,28,28,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  toastPoster: { width: 44, height: 62, borderRadius: 8, backgroundColor: '#222' },
  toastIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  toastTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  toastBody: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
});
