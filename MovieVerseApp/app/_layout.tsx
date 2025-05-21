import ScreenWrapper from "@/components/ScreenWrapper";
import { Stack } from "expo-router";
//import { StatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from './auth/AuthContext';
import { SafeAreaView } from "react-native";
export default function RootLayout() {
  return (
    <AuthProvider>
    <ScreenWrapper>
      <SafeAreaView />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenWrapper>
    </AuthProvider>
  );
}