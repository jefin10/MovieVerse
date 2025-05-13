import React, { useState, useEffect } from 'react';
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
  Keyboard,
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { getCSRFToken, storeSessionCookie } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const [username, setUsername] = useState('foxie@email.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { setAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    console.log('Fetching CSRF token...');
    getCSRFToken();
    console.log('CSRF token fetched');
  }, []);

  const handleLogin = async () => {
    console.log('Login button pressed');
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      await getCSRFToken();

      const res = await api.post('api/auth/login/', { username, password });
      const setCookie = res.headers['set-cookie'] || res.headers['Set-Cookie'];
      console.log('Set-Cookie:', setCookie);
      await storeSessionCookie(setCookie);

      Alert.alert('Success', 'Logged in and session stored');
      setAuthenticated(true);
      router.push('/(tabs)'); 

    } catch (err) {
      console.log('Login error:', err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.error || 'Error logging in');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine label colors based on input state
  const emailLabelStyle = {
    ...styles.label,
    color: emailFocused || username ? '#FFFFFF' : '#888888',
  };
  
  const passwordLabelStyle = {
    ...styles.label,
    color: passwordFocused || password ? '#FFFFFF' : '#888888',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.topSection}>
              <View style={styles.imageContainer}>
                <Image 
                  source={require('@/assets/images/MVV.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>Login</Text>
            <View style={styles.bottomSection}>
              <View style={styles.form}>
                <Text style={emailLabelStyle}>Email</Text>
                <View style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
                
                <Text style={passwordLabelStyle}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#999"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.button,
                    isLoading && styles.buttonLoading
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#000" />
                      <Text style={[styles.buttonText, {marginLeft: 10}]}>Logging in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  logo: {
    width: 500,
    height: 500,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between', 
    backgroundColor: '#000000',
    padding: 20,
  },
  buttonLoading: {
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center', 
    paddingTop: 120,
    marginTop: 0,
  },
  bottomSection: {
    marginBottom: 30, 
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    fontVariant: ['small-caps'],
    fontFamily: 'Poppins_700Bold',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  form: {
    backgroundColor: '#000',
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
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    marginLeft: 19,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 40,
    marginBottom: 15,
    backgroundColor: '#111',
  },
  inputContainerFocused: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  input: {
    height: 70,
    paddingHorizontal: 19,
    fontSize: 20,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    height: 65,
    padding: 15,
    borderRadius: 40,
    alignItems: 'center',
    marginTop: 60,
    justifyContent: 'center', 
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 26,
    fontWeight: 'bold',
  },
});

export default LoginScreen;