import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '@/styles/ForgotPassword';

const ForgotPasswordScreen = () => {
  const [username, setUsername] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setIsLoading(true);
    
    try {
      const res=await api.post('api/auth/forgot-password/s', { username });
      await AsyncStorage.setItem('username', username);
      if(res.status ==200){
        router.push('/pages/VerifyOtpPage')
      }
      else{
        router.push('/pages/VerifyOtpPage')
        Alert.alert('Error', 'Failed to send password reset request. Please try again.');
        setIsLoading(false);
      }
      
      
    } catch (err) {
        router.push('/pages/VerifyOtpPage')
      console.log('Password reset request error:', err.response?.data || err.message);
     
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/pages/LoginPage');
  };

  const usernameLabelStyle = {
    ...styles.label,
    color: usernameFocused || username ? '#FFFFFF' : '#888888',
  };
  
  const getUsernameBorderStyle = () => {
    if (usernameFocused) return styles.inputContainerFocused;
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.title}>Forgot Password</Text>
            <View style={styles.bottomSection}>
              <View style={styles.form}>
                <Text style={styles.instructions}>
                  Enter your username to receive an OTP to your registered email.
                </Text>
                
                <Text style={usernameLabelStyle}>Username</Text>
                <View style={[
                  styles.inputContainer,
                  getUsernameBorderStyle()
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    onFocus={() => setUsernameFocused(true)}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default ForgotPasswordScreen;