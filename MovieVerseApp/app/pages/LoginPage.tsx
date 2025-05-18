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
import styles from '@/styles/LoginPage';

const LoginScreen = () => {
  const [username, setUsername] = useState('foxpotato71');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { setAuthenticated } = useAuth();
  const router = useRouter();
  const [sessionid, setSessionid] = useState(null);
  const [csrftoken, setCsrfToken] = useState(null);
  
  useEffect(() => {
    console.log('Fetching CSRF token...');
    getCSRFToken();
    console.log('CSRF token fetched');
    const fetchSessionCookie = async () => {
      const sessionid2 = await AsyncStorage.getItem('sessionid');
      const csrftoken2 = await AsyncStorage.getItem('csrftoken');
      setSessionid(sessionid2);
      setCsrfToken(csrftoken2);
      console.log('Session ID:', sessionid);
      console.log('CSRF Token:', csrftoken);
    };
    fetchSessionCookie();
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

      const res = await api.post('api/auth/login/', {
        username, 
        password
      }, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Cookie': `sessionid=${sessionid}; csrftoken=${csrftoken}`
        }
      });
      const setCookie = res.headers['set-cookie'] || res.headers['Set-Cookie'];
      console.log('Set-Cookie:', setCookie);
      await storeSessionCookie(setCookie);
      await AsyncStorage.setItem('username', username);
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

  const goToRegister = () => {
  router.push('/pages/RegisterPage');
  };

  const goToForgotPassword = () => {
    router.push('/pages/ForgotPassUsername');
  }

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
                <TouchableOpacity onPress={goToForgotPassword}>
                  <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                </TouchableOpacity>
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={goToRegister}>
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
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



export default LoginScreen;