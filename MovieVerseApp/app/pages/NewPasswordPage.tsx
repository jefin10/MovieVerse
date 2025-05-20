import React, { useState, useEffect,useRef } from 'react';
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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import styles from '@/styles/NewPassword';

const NewPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState('');
  // Get token from URL params
  const { token, email } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  // Validate password strength (min 6 chars)
  useEffect(() => {
    setIsPasswordValid(password.length >= 6);
    setDoPasswordsMatch(password === confirmPassword && password !== '');
    const getUsername = async () => {
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername);
    }
    getUsername();
  }, [password, confirmPassword]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        // Scroll to active input when keyboard shows
        const scrollPosition = confirmPasswordFocused ? 180 : 80;
        scrollViewRef.current?.scrollTo({ y:scrollPosition,animated: true });
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Return to normal position when keyboard hides
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    // Cleanup listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
   
      const res=await api.post('api/auth/reset-password/', { 
        username,
        password
      });
      
      if(res.status === 200) {
        Alert.alert('Success', 'Password reset successfully. You can now log in.', [
          { text: 'OK', onPress: () => router.push('/pages/LoginPage') }
        ]);
      } else {
        Alert.alert('Error', 'Failed to reset password. Please try again.');
      }
      
    } catch (err) {
      console.log('Password reset error:', err.response?.data || err.message);
      Alert.alert(
        'Error',
        'Failed to reset password. The link may be invalid or expired.',
        [{ text: 'Try Again', onPress: () => router.push('/pages/ForgotPassUsername') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordLabelStyle = {
    ...styles.label,
    color: passwordFocused || password ? '#FFFFFF' : '#888888',
  };
  
  const confirmPasswordLabelStyle = {
    ...styles.label,
    color: confirmPasswordFocused || confirmPassword ? '#FFFFFF' : '#888888',
  };

  const getPasswordBorderStyle = () => {
    if (passwordFocused) return styles.inputContainerFocused;
    if (password && isPasswordValid) return styles.inputContainerValid;
    if (password && !isPasswordValid) return styles.inputContainerInvalid;
    return null;
  };

  const getConfirmPasswordBorderStyle = () => {
    if (confirmPasswordFocused) return styles.inputContainerFocused;
    if (confirmPassword && doPasswordsMatch) return styles.inputContainerValid;
    if (confirmPassword && !doPasswordsMatch) return styles.inputContainerInvalid;
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
         keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
      >
        <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        >

        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.title}>New Password</Text>
            <View style={styles.bottomSection}>
              <View style={styles.form}>
                <Text style={styles.instructions}>
                  Please create a new password for your account.
                </Text>
                
                <Text style={passwordLabelStyle}>New Password</Text>
                <View style={[
                  styles.inputContainer,
                  getPasswordBorderStyle()
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a new password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#999"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </View>
                {password && !isPasswordValid && !passwordFocused && (
                  <Text style={styles.invalidMessage}>Password must be at least 6 characters</Text>
                )}
                
                <Text style={confirmPasswordLabelStyle}>Confirm Password</Text>
                <View style={[
                  styles.inputContainer,
                  getConfirmPasswordBorderStyle()
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholderTextColor="#999"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                </View>
                {confirmPassword && !doPasswordsMatch && !confirmPasswordFocused && (
                  <Text style={styles.invalidMessage}>Passwords do not match</Text>
                )}
                
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
                      <Text style={[styles.buttonText, {marginLeft: 10}]}>Updating...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => router.push('/(tabs)')}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <View style={{height: 80}} />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default NewPasswordPage;