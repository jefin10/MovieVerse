// components/ScreenWrapper.tsx
import { SafeAreaView, StyleSheet, View } from 'react-native';
import React from 'react';
import {styles}  from "@/styles/screenWrapper"
 interface Props {
  children: React.ReactNode;
}

const ScreenWrapper = ({ children }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default ScreenWrapper;

