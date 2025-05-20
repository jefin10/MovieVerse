import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  ActivityIndicator,
  findNodeHandle
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '@/styles/ForgotPassword';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ForgotPasswordScreen = () => {
  const [username, setUsername] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Create refs for keyboard handling
  const scrollViewRef = useRef(null);
  const usernameInputRef = useRef(null);

  const handleSubmit = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await api.post('api/auth/forgot-password/s', { username });
      await AsyncStorage.setItem('username', username);
      if(res.status === 200){
        router.push('/pages/VerifyOtpPage');
      }
      else {
        router.push('/pages/VerifyOtpPage');
        Alert.alert('Error', 'Failed to send password reset request. Please try again.');
      }
    } catch (err) {
      router.push('/pages/VerifyOtpPage');
      console.log('Password reset request error:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/pages/LoginPage');
  };

  // Handle username input focus
  const handleUsernameFocus = () => {
    setUsernameFocused(true);
    // Add slight delay to ensure keyboard is showing
    setTimeout(() => {
      if (scrollViewRef.current && usernameInputRef.current) {
        const nodeHandle = findNodeHandle(usernameInputRef.current);
        if (nodeHandle) {
          scrollViewRef.current.scrollToFocusedInput(nodeHandle);
        }
      }
    }, 200);
  };

  const usernameLabelStyle = {
    ...styles.label,
    color: usernameFocused || username ? '#FFFFFF' : '#888888',
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
        extraHeight={150}
        extraScrollHeight={100}
        enableResetScrollToCoords={true}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyboardOpeningTime={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Top spacing container to push content down */}
            <View style={styles.topSpacing} />
            
            <Text style={styles.title}>Forgot Password</Text>
            
            <View style={styles.bottomSection}>
              <View style={styles.form}>
                <Text style={styles.instructions}>
                  Enter your username to receive an OTP to your registered email.
                </Text>
                
                <Text style={usernameLabelStyle}>Username</Text>
                <View style={[
                  styles.inputContainer,
                  usernameFocused && styles.inputContainerFocused
                ]}>
                  <TextInput
                    ref={usernameInputRef}
                    style={styles.input}
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    onFocus={handleUsernameFocus}
                    onBlur={() => setUsernameFocused(false)}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.button,
                    isLoading && styles.buttonLoading
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#000" />
                      <Text style={[styles.buttonText, {marginLeft: 10}]}>Sending...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
                
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Remember your password? </Text>
                  <TouchableOpacity onPress={goToLogin}>
                    <Text style={styles.loginLink}>Login</Text>
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

export default ForgotPasswordScreen;