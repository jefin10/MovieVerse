import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const mood = () => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/pages/LoadingPage');
  }

  return (
    <View style={styles.container}>
      <Text>mood</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleNavigate}
      >
        <Text style={styles.buttonText}>Go to Loading Page</Text>
      </TouchableOpacity>
    </View>
  )
}

export default mood

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
})