import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from '../auth/api';

const TOKEN_KEY = 'movieverse-push-token';
const ASKED_KEY = 'movieverse-push-asked';
/** Set while a new account is still in first-run setup. */
export const ONBOARDING_KEY = 'onboardingPending';

Notifications.setNotificationHandler({
  // In the app, the in-app toast shows it instead of a system banner.
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const CHANNELS = [
  { id: 'tonights-pick', name: "Tonight's Pick", description: 'One movie picked for you each evening' },
  { id: 'streaming-alerts', name: 'Streaming alerts', description: 'When a watchlist movie reaches your services' },
  { id: 'friends', name: 'Friends', description: 'New followers' },
  { id: 'watch-together', name: 'Watch Together', description: 'Matches in your rooms' },
];

const setUpChannels = async () => {
  if (Platform.OS !== 'android') return;
  await Promise.all(
    CHANNELS.map((c) =>
      Notifications.setNotificationChannelAsync(c.id, {
        name: c.name,
        description: c.description,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 180, 120, 180],
        lightColor: '#FFFFFF',
      }),
    ),
  );
};

/**
 * Registers this phone for push. Failure is fine: the in-app inbox still works,
 * and a build without Firebase set up can't get a token at all.
 *
 * Android only lets an app ask a limited number of times, so the prompt waits
 * until the user has seen why (first-run setup) and is never repeated.
 */
export const registerForPush = async ({ ask = false, remember = false }: { ask?: boolean; remember?: boolean } = {}) => {
  try {
    await setUpChannels();
    if (!Device.isDevice) return;
    if (remember) await AsyncStorage.setItem(ASKED_KEY, 'true');
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted' && ask) ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.post('api/push-tokens/', { token, platform: Platform.OS });
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err: any) {
    console.log('Push not available:', err?.message);
  }
};

/** Existing users skipped first-run setup, so they get one direct prompt. */
export const registerOnLaunch = async () => {
  const [asked, onboarding] = await Promise.all([AsyncStorage.getItem(ASKED_KEY), AsyncStorage.getItem(ONBOARDING_KEY)]);
  if (onboarding) return;
  await registerForPush({ ask: !asked, remember: true });
};

/** Run before signing out, while the session can still authorize it. */
export const unregisterFromPush = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return;
    await api.delete('api/push-tokens/', { data: { token } });
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // Signing out still has to succeed.
  }
};

/** Where a notification's data says to go when it's tapped. */
export const routeForNotification = (data: any) => {
  if (data?.movieId) return { pathname: '/pages/MovieDetailPage', params: { movieId: String(data.movieId) } };
  if (data?.username) return { pathname: '/pages/UserProfilePage', params: { username: String(data.username) } };
  return { pathname: '/(tabs)/notifications', params: {} };
};
