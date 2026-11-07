import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { s } from '../services/ui';

const PageHeader = ({ title, right }: { title: string; right?: React.ReactNode }) => {
  const router = useRouter();
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} accessibilityLabel="Back">
        <Feather name="arrow-left" size={22} color="#fff" />
      </TouchableOpacity>
      <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      {right}
    </View>
  );
};

export default PageHeader;
