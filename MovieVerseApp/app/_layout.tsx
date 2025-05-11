// app/_layout.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider } from './auth/AuthContext';
export default function RootLayout() {
  return (
    <AuthProvider>
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenWrapper>
    </AuthProvider>
  );
}