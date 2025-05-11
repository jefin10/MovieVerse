import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import api, { getCSRFToken } from '../auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router';

const RouteTestScreen = ({ navigation }) => {
  // Function to navigate to the first route
  const router = useRouter();
  const navigateToFirstRoute = async() => {
    // Replace 'FirstRoute' with your actual route name
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');
     if (!sessionid || !csrftoken) {
      console.warn('Missing session or CSRF token');
      return;
    }
     const res = await api.post(
      'ai/recommend/',
      { mood: 'happy' },
      {
        headers: {
          'X-CSRFToken': csrftoken,
          Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
        },
      }
    );
    console.log(res.data);
    console.log('Navigating to First Route');
  };

  // Function to navigate to the second route
  const navigateToSecondRoute = () => {
    // Replace 'SecondRoute' with your actual route name
    router.push('/pages/LogoutPage')
    //navigation.navigate('SecondRoute');
    console.log('Navigating to Second Route');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Route Testing Page</Text>
        <Text style={styles.subtitle}>Tap a button to test navigation</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.button1]} 
            onPress={navigateToFirstRoute}
          >
            <Text style={styles.buttonText}>Route One</Text>
            <Text style={styles.buttonDescription}>Navigate to your first route</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.button2]} 
            onPress={navigateToSecondRoute}
          >
            <Text style={styles.buttonText}>Route Two</Text>
            <Text style={styles.buttonDescription}>Navigate to your second route</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Current Screen: Route Test
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button1: {
    backgroundColor: '#4285F4', // Google Blue
  },
  button2: {
    backgroundColor: '#34A853', // Google Green
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
  },
});

export default RouteTestScreen;

// ------------------------------------------------
// Example of how to use this in your navigation setup:
// ------------------------------------------------
/*
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RouteTestScreen from './RouteTestScreen';
// Import your other screens
// import FirstRouteScreen from './FirstRouteScreen';
// import SecondRouteScreen from './SecondRouteScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RouteTest">
        <Stack.Screen 
          name="RouteTest" 
          component={RouteTestScreen} 
          options={{ title: 'Route Tester' }}
        />
        <Stack.Screen 
          name="FirstRoute" 
          component={FirstRouteScreen} 
          options={{ title: 'First Route' }}
        />
        <Stack.Screen 
          name="SecondRoute" 
          component={SecondRouteScreen} 
          options={{ title: 'Second Route' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
*/