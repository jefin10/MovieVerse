// app/_layout.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenWrapper>
  );
}