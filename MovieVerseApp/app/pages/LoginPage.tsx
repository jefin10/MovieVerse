import React, { useState,useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { getCSRFToken,storeSessionCookie  } from '../auth/api'; // Adjust the import path as necessary

const LoginScreen = () => {
  const [username, setUsername] = useState('foxie@email.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
    // Get CSRF token when component mounts
    console.log('Fetching CSRF token...');
    getCSRFToken();
    console.log('CSRF token fetched');
  }, []);
  // Function to handle login
 const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert('Error', 'Please enter both username and password');
    return;
  }

  setIsLoading(true);

  try {
    await getCSRFToken();

    const res = await api.post('api/auth/login/', { username, password });

    // Extract and store cookies
    const setCookie = res.headers['set-cookie'] || res.headers['Set-Cookie'];
    console.log('Set-Cookie:', setCookie);
    await storeSessionCookie(setCookie);

    Alert.alert('Success', 'Logged in and session stored');

  } catch (err:any) {
    console.log('Login error:', err.response?.data || err.message);
    Alert.alert('Login Failed', err.response?.data?.error || 'Error logging in');
  } finally {
    setIsLoading(false);
  }
};

  const checkStoredData = async () => {
    try {
      const userData = await AsyncStorage.getItem('csrftoken');
      if (userData) {
        const parsedData = JSON.parse(userData);
        Alert.alert(
          'Stored Data', 
          `Username: ${parsedData.username}\nLogged in: ${parsedData.loggedIn}\nLogin time: ${parsedData.loginTime}`
        );
      } else {
        Alert.alert('Info', 'No stored login data found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve data');
      console.error('Retrieval error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Login</Text>
          
          <View style={styles.form}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkButton}
              onPress={checkStoredData}
            >
              <Text style={styles.checkButtonText}>Check Stored Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
});

export default LoginScreen;