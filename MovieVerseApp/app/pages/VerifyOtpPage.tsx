import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '@/styles/VerifyOtp';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const VerifyOtpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [canResend, setCanResend] = useState(false);
  const [username, setUsername] = useState('');
  const inputRefs = useRef([]);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    const getUsername = async () => {
      try {
        const res = await AsyncStorage.getItem('username');
        setUsername(res);
        const result = await api.post('api/auth/getEmail/', {
          username: res // Use res instead of username to avoid stale state
        });
        console.log(result.data);
        setEmail(result.data.email);
      } catch (error) {
        console.error('Error getting username or email:', error);
      }
    };

    // Run getUsername with shorter retries
    const runMultipleTimes = async () => {
      for (let i = 0; i < 3; i++) {
        await getUsername();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    runMultipleTimes();
  }, []);

  const handleOtpChange = (text, index) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    
    if (numericValue && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits of your OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await api.post('api/auth/verify-otp/', {
        username,
        otp: fullOtp
      });
      
      if (result.status === 200) {
        Alert.alert('Success', 'OTP verified successfully!');
        router.replace('/pages/NewPasswordPage');
      } else {
        Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      }
    } catch (err) {
      console.log('OTP verification error:', err.response?.data || err.message);
      Alert.alert(
        'Verification Failed',
        'The OTP you entered is incorrect or has expired. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    
    try {
      await api.post('api/auth/forgot-password/', {
        username
      });

      setTimeLeft(60);
      setCanResend(false);
      
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
    } catch (err) {
      console.log('Resend OTP error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Focus handler for OTP inputs
  const handleOtpInputFocus = (index) => {
    setTimeout(() => {
      if (scrollViewRef.current && inputRefs.current[index]) {
        scrollViewRef.current.scrollToFocusedInput(inputRefs.current[index]);
      }
    }, 200);
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.inner}>
            <Text style={styles.title}>Verify OTP</Text>
            
            <View style={styles.form}>
              <Text style={styles.instructions}>
                We've sent a verification code to:
              </Text>
              
              <Text style={styles.emailDisplay}>
                {email || ''}
              </Text>
              
              <Text style={styles.subtitle}>
                Enter the 6-digit verification code
              </Text>
              
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="number-pad"
                    selectTextOnFocus
                    selectionColor="#FFFFFF"
                    cursorColor="#FFFFFF"
                    onFocus={() => handleOtpInputFocus(index)}
                  />
                ))}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.button,
                  isLoading && styles.buttonLoading
                ]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#000" />
                    <Text style={[styles.buttonText, {marginLeft: 10}]}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive the code? {!canResend && `Resend in ${timeLeft}s`}
                </Text>
                
                {canResend && (
                  <TouchableOpacity 
                    onPress={handleResendOtp}
                    disabled={isLoading}
                  >
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default VerifyOtpPage;