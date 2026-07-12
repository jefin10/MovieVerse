import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api, { clearAuth } from '../auth/api';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/AuthContext'; 

const LogoutScreen = () => {
  const router = useRouter();
    const { setAuthenticated } = useAuth(); 
  useEffect(() => {
    const performLogout = async () => {
      try {
        await api.post('api/auth/logout/', {});
      } catch (error) {
        console.warn('Logout request failed; clearing local session anyway.', error);
      } finally {
        await clearAuth();
        setAuthenticated(false);
        router.replace('/pages/LoginPage');
      }
    };

    performLogout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Logging out...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default LogoutScreen;
