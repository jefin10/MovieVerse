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
  Image
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
    // Your existing login logic
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
                
                <Text style={passwordLabelStyle}>Password</Text>
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
                
                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Text>
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
    fontFamily:'Poppins_700Bold',
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
    
    // Default color is set dynamically
  },
  input: {
    height: 70,
    borderWidth: 1,
    borderColor: '#333', 
    borderRadius: 40,
    marginBottom: 15,
    paddingHorizontal: 19,
    backgroundColor: '#111', 
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