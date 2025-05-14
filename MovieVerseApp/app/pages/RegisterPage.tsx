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
  ActivityIndicator
} from 'react-native';
import api, { getCSRFToken } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '@/styles/RegisterPage';
const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailFocused, setEmailFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  // Add validation states for each field
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { setAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getCSRFToken();
  }, []);

  // Validate email format
  useEffect(() => {
    if (!email) {
      setIsEmailValid(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);
  
  // Validate password (min 6 chars)
  useEffect(() => {
    setIsPasswordValid(password.length >= 6);
    setDoPasswordsMatch(password === confirmPassword && password !== '');
  }, [password, confirmPassword]);

  // Debounced username check
  const checkUsernameAvailability = debounce(async (username) => {
    if (!username.trim()) return;

    try {
      setCheckingUsername(true);
      const response = await api.get(`api/auth/check-username/?username=${username}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.log('Username check failed:', error.message);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, 500);

  // Trigger on username change
  useEffect(() => {
    setUsernameAvailable(null);
    if (username) checkUsernameAvailability(username);
  }, [username]);

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isEmailValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (usernameAvailable === false) {
      Alert.alert('Username Taken', 'Please choose a different username');
      return;
    }

    setIsLoading(true);

    try {
      await getCSRFToken();
      await api.post('api/auth/register/', { 
        email,
        username, 
        password,
      });
      Alert.alert('Success', 'Account created successfully!');
      await AsyncStorage.setItem('username', username);
      router.push('/pages/LoginPage');
    } catch (err) {
      console.log('Registration error:', err.response?.data || err.message);
      Alert.alert('Registration Failed', err.response?.data?.error || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  const emailLabelStyle = {
    ...styles.label,
    color: emailFocused || email ? '#FFFFFF' : '#888888',
  };

  const usernameLabelStyle = {
    ...styles.label,
    color: usernameFocused || username ? '#FFFFFF' : '#888888',
  };

  const passwordLabelStyle = {
    ...styles.label,
    color: passwordFocused || password ? '#FFFFFF' : '#888888',
  };

  const confirmPasswordLabelStyle = {
    ...styles.label,
    color: confirmPasswordFocused || confirmPassword ? '#FFFFFF' : '#888888',
  };

  // Get appropriate border style based on field state
  const getEmailBorderStyle = () => {
    if (emailFocused) return styles.inputContainerFocused;
    if (email && isEmailValid) return styles.inputContainerValid;
    if (email && !isEmailValid) return styles.inputContainerInvalid;
    return null;
  };

  const getUsernameBorderStyle = () => {
    if (usernameFocused) return styles.inputContainerFocused;
    if (username && usernameAvailable === true) return styles.inputContainerValid;
    if (username && usernameAvailable === false) return styles.inputContainerInvalid;
    return null;
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

  const goToLogin = ()=>{

    router.replace('/pages/LoginPage');
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.title}>Register</Text>
            <View style={styles.bottomSection}>
              <View style={styles.form}>
                <Text style={emailLabelStyle}>Email</Text>
                <View style={[
                  styles.inputContainer,
                  getEmailBorderStyle()
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
                {email && !isEmailValid && !emailFocused && (
                  <Text style={styles.invalidMessage}>Please enter a valid email address</Text>
                )}

                <Text style={usernameLabelStyle}>Username</Text>
                <View style={[
                  styles.inputContainer,
                  getUsernameBorderStyle()
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Choose a username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                  />
                </View>
                {checkingUsername && <Text style={styles.checking}>Checking username...</Text>}
                {username.length > 0 && usernameAvailable === false && (
                  <Text style={styles.unavailable}>❌ Username is already taken</Text>
                )}
                {username.length > 0 && usernameAvailable === true && (
                  <Text style={styles.available}>✅ Username is available</Text>
                )}

                <Text style={passwordLabelStyle}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  getPasswordBorderStyle()
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
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
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={goToLogin}>
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.button,
                    isLoading && styles.buttonLoading
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#000" />
                      <Text style={[styles.buttonText, {marginLeft: 10}]}>Creating Account...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
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


export default RegisterScreen;