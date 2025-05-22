import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Image,
  ActivityIndicator,
  findNodeHandle
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { getCSRFToken, storeSessionCookie } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from 'expo-router';
import styles from '@/styles/LoginPage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { setAuthenticated } = useAuth();
  const router = useRouter();
  const [sessionid, setSessionid] = useState(null);
  const [csrftoken, setCsrfToken] = useState(null);
  
  // Create refs for inputs and scrollview
  const scrollViewRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  useEffect(() => {
    getCSRFToken();
    const fetchSessionCookie = async () => {
      const sessionid2 = await AsyncStorage.getItem('sessionid');
      const csrftoken2 = await AsyncStorage.getItem('csrftoken');
      setSessionid(sessionid2);
      setCsrfToken(csrftoken2);
    };
    fetchSessionCookie();
  }, []);

  const handleLogin = async () => {
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
      await storeSessionCookie(setCookie);
      await AsyncStorage.setItem('username', username);
      setAuthenticated(true);
      router.push('/(tabs)'); 

    } catch (err) {
      console.log('Login error:', err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.error || 'Error logging in');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email input focus
  const handleEmailFocus = () => {
    setEmailFocused(true);
    // Add slight delay to ensure keyboard is showing
    setTimeout(() => {
      if (scrollViewRef.current && emailInputRef.current) {
        const nodeHandle = findNodeHandle(emailInputRef.current);
        if (nodeHandle) {
          scrollViewRef.current.scrollToFocusedInput(nodeHandle);
        }
      }
    }, 200);
  };

  // Handle password input focus
  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    // Add slight delay to ensure keyboard is showing
    setTimeout(() => {
      if (scrollViewRef.current && passwordInputRef.current) {
        const nodeHandle = findNodeHandle(passwordInputRef.current);
        if (nodeHandle) {
          scrollViewRef.current.scrollToFocusedInput(nodeHandle);
        }
      }
    }, 200);
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={200}
        extraScrollHeight={150}
        enableResetScrollToCoords={true}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyboardOpeningTime={0}
        keyboardDismissMode="interactive"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Logo Container */}
            <View style={styles.logoOuterContainer}>
              <View style={styles.imageContainer}>
                <Image 
                  source={require('@/assets/images/MVV.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Login</Text>
              <View style={styles.bottomSection}>
                <View style={styles.form}>
                  <Text style={emailLabelStyle}>Username</Text>
                  <View style={[
                    styles.inputContainer,
                    emailFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      placeholder="Enter your username"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      placeholderTextColor="#999"
                      onFocus={handleEmailFocus}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>
                  
                  <Text style={passwordLabelStyle}>Password</Text>
                  <View style={[
                    styles.inputContainer,
                    passwordFocused && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholderTextColor="#999"
                      onFocus={handlePasswordFocus}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;