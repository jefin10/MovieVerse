import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VerifyOtpPage = () => {
  const router = useRouter();
  const [ email,setEmail ] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [canResend, setCanResend] = useState(false);
 
  const [username, setUsername] = useState('');
  const inputRefs = useRef([]);

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

  useEffect(()=>{
    const getUsername=async()=>{
        const res=await AsyncStorage.getItem('username')
        setUsername(res)
        const result=await api.post('api/auth/getEmail/',{
            username:username
        })
        console.log(result.data)
        setEmail(result.data.email)
    }

    getUsername()
  },[])

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
      
      const result=await api.post('api/auth/verify-otp/', {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Verify Email</Text>
          
          <View style={styles.form}>
            <Text style={styles.instructions}>
              We've sent a verification code to:
            </Text>
            
            <Text style={styles.emailDisplay}>
              {email || 'user@example.com'}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  inner: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 0,
    marginTop: '65%',
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
    color: '#fff',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  emailDisplay: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#fff',
    height: 65,
    padding: 15,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  buttonText: {
    color: '#000',
    fontSize: 26,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  resendText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 10,
  },
  resendLink: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: '',
  },
});

export default VerifyOtpPage;