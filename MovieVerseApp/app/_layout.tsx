import 'react-native-gesture-handler';
import ScreenWrapper from "@/components/ScreenWrapper";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from 'expo-font';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './auth/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  // Preload + force-bundle the vector-icon fonts so icons render in standalone
  // (release) builds, not just in Expo Go. Non-blocking: the UI renders
  // immediately and icons appear once the fonts finish loading.
  useFonts({
    ...Feather.font,
    ...Ionicons.font,
    ...FontAwesome.font,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ScreenWrapper>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </ScreenWrapper>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}