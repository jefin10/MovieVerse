import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../auth/api'; 
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/AuthContext'; 

const LogoutScreen = () => {
  const router = useRouter();
    const { setAuthenticated } = useAuth(); 
  useEffect(() => {
    const performLogout = async () => {
      try {
        const csrftoken = await AsyncStorage.getItem('csrftoken');
        const sessionid = await AsyncStorage.getItem('sessionid');

        if (!csrftoken || !sessionid) {
          throw new Error('Missing authentication info.');
        }

        await api.post(
          'api/auth/logout/',
          {},
          {
            headers: {
              'X-CSRFToken': csrftoken,
              Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
            },
          }
        );

        await AsyncStorage.multiRemove(['sessionid', 'csrftoken']);

        Alert.alert('Success', 'You have been logged out.');
        setAuthenticated(false);

        router.replace('/pages/LoginPage'); 

      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Logout failed.');
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
