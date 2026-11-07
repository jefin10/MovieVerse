import ScreenWrapper from '@/components/ScreenWrapper';
import { ToastProvider, color, motion } from '@/ui';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { AuthProvider } from './auth/AuthContext';
import { NotificationProvider } from './components/NotificationCenter';
import OfflineBanner from './components/OfflineBanner';

// Helpers live under app/ (services, auth, components), so expo-router warns they
// aren't screens. Known and harmless; dev builds only.
LogBox.ignoreLogs(['missing the required default export']);

export default function RootLayout() {
  // Preload the icon fonts the original movie detail, swipe and watchlist screens use.
  useFonts({ ...Feather.font, ...FontAwesome.font });
  const reduceMotion = useReducedMotion();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg }}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <ScreenWrapper>
              <StatusBar style="light" />
              <OfflineBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: color.bg },
                  // Platform slide with parallax underneath; a plain crossfade with reduce motion.
                  animation: reduceMotion ? 'fade' : Platform.OS === 'android' ? 'ios_from_right' : 'default',
                  animationDuration: motion.duration.slow,
                  gestureEnabled: true,
                }}
              />
            </ScreenWrapper>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
