import { Text, View, TouchableOpacity, TextInput, ScrollView, Image, StatusBar, ActivityIndicator,SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons';
import { moodStyles } from '@/styles/mood'
import MovieGrid from '@/components/MovieGrid'
import ProtectedRoute from '../auth/protectedRoute'
import api, { getCSRFToken } from '../auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams } from 'expo-router';

const Mood = () => {

  const params = useLocalSearchParams();
  const initialMood = params.selectedMood as string;

  const router = useRouter()
  const [moodAvailable, setMoodAvailable] = useState(false)
  const [selectedMood, setSelectedMood] = useState('')
  const [isOpenOther, setOpenOther] = useState(false)
  const [customMood, setCustomMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendedMovies, setRecommendedMovies] = useState([])
  const [error, setError] = useState('')
  const [predictedGenre, setPredictedGenre] = useState('');
  
  React.useEffect(() => {
    if (initialMood) {
      getMoodRecommendations(initialMood);
    }
  }, [initialMood]);
  
  // Helper function to ensure image URLs are complete
  const ensureCompleteImageUrl = (url) => {
    if (!url) return null;
    
    // If the URL already starts with http/https, it's complete
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path or just the path component from TMDB
    return `https://image.tmdb.org/t/p/w500${url}`;
  };
  
  // In the getMoodRecommendations function, update the way poster URLs are processed

const getMoodRecommendations = async (mood) => {
  setLoading(true)
  setError('')
  const sessionid = await AsyncStorage.getItem('sessionid');
  const csrftoken = await AsyncStorage.getItem('csrftoken');
  
  try {
    // Call the Django backend API endpoint for mood-based recommendations
    const response = await api.post('https://mvbackend-6fr8.onrender.com/ai/recommend/', {
      mood: mood
    },
    {
      headers: {
        'X-CSRFToken': csrftoken,
        Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
      },
    });
    
    // Get the predicted genre from the response
    const genre = response.data.genre || 'Unknown';
    setPredictedGenre(genre);
    
    // Process the response data to ensure complete poster URLs
    const processedMovies = response.data.recommendations.map(movie => ({
      ...movie,
      // Ensure the poster URL is complete
      poster_url: movie.poster_url ? (
        movie.poster_url.startsWith('http') ? 
          movie.poster_url : 
          `https://image.tmdb.org/t/p/w500${movie.poster_url}`
      ) : null
    })) || [];
    
    setRecommendedMovies(processedMovies)
    setSelectedMood(mood)
    setMoodAvailable(true)
  } catch (err) {
    console.error('Failed to get mood recommendations:', err)
    setError('Failed to get recommendations. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const selectMood = (mood) => {
    setSelectedMood(mood)
    getMoodRecommendations(mood)
  }

  const handleCustomMood = () => {
    if (customMood.trim()) {
      selectMood(customMood)
    }
    setOpenOther(false)
  }

  // Rest of the component remains unchanged
  return (
    <ProtectedRoute>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>

      
       <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={moodStyles.container}>
        <ScrollView contentContainerStyle={moodStyles.scrollContent}>
          {loading ? (
            <View style={moodStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5500" />
              <Text style={moodStyles.loadingText}>Finding movies for your mood...</Text>
            </View>
          ) : moodAvailable ? (
            <View style={moodStyles.moodResultContainer}>
              <Text style={moodStyles.moodResultTitle}>You are currently in the mood for {predictedGenre}</Text>
              <Text style={moodStyles.moodResultSubtitle}>Here are our suggestions</Text>
              
              {error ? (
                <Text style={moodStyles.errorText}>{error}</Text>
              ) : (
                <MovieGrid movies={recommendedMovies} mood={selectedMood} />
              )}

              <TouchableOpacity 
                style={moodStyles.changeMoodButton}
                onPress={() => setMoodAvailable(false)}
              >
                <Text style={moodStyles.changeMoodButtonText}>Change Mood</Text>
              </TouchableOpacity>
            </View>
          )  : (
            <View style={moodStyles.moodSelector}>
              <Text style={moodStyles.moodTitle}>How are you feeling today?</Text>
              <Text style={moodStyles.moodSubtitle}>Get movies personalized for your mood</Text>
              
              <View style={moodStyles.moodButtonsRow}>
                <TouchableOpacity 
                  style={moodStyles.moodButton}
                  onPress={() => selectMood('dramatic movie')}
                >
                  <Text style={moodStyles.moodButtonText}>I'm feeling Happy</Text>
                </TouchableOpacity>
              </View>
              
              <View style={moodStyles.moodButtonsRow}>
                <TouchableOpacity 
                  style={[moodStyles.moodButton, moodStyles.moodButtonLight]}
                  onPress={() => selectMood('comedy')}
                >
                  <Text style={[moodStyles.moodButtonText, moodStyles.moodButtonTextDark]}>I'm feeling Sad</Text>
                </TouchableOpacity>
              </View>
              
              <View style={moodStyles.moodButtonsRow}>
                <TouchableOpacity 
                  style={moodStyles.moodButton}
                  onPress={() => selectMood('Romantic')}
                >
                  <Text style={moodStyles.moodButtonText}>I'm feeling Romantic</Text>
                </TouchableOpacity>
              </View>
              
              <View style={moodStyles.moodButtonsRow}>
                <TouchableOpacity 
                  style={[moodStyles.moodButton, moodStyles.moodButtonLight]}
                  onPress={() => selectMood('fantasy')}
                >
                  <Text style={[moodStyles.moodButtonText, moodStyles.moodButtonTextDark]}>I'm feeling Lonely</Text>
                </TouchableOpacity>
              </View>
              
              <View style={moodStyles.moodButtonsRow}>
                <TouchableOpacity 
                  style={moodStyles.moodButton}
                  onPress={() => selectMood('Adventurous')}
                >
                  <Text style={moodStyles.moodButtonText}>I'm feeling Adventurous</Text>
                </TouchableOpacity>
              </View>
              
              <View style={moodStyles.moodButtonsRow}>
                <TouchableOpacity 
                  style={[moodStyles.moodButton, moodStyles.moodButtonLight]}
                  onPress={() => selectMood('Action')}
                >
                  <Text style={[moodStyles.moodButtonText, moodStyles.moodButtonTextDark]}>I'm feeling Bad</Text>
                </TouchableOpacity>
              </View>
              
              {isOpenOther ? (
                <View style={moodStyles.customMoodContainer}>
                  <TextInput
                    style={moodStyles.customMoodInput}
                    placeholder="Enter your mood..."
                    placeholderTextColor="#8a8a8a"
                    value={customMood}
                    onChangeText={setCustomMood}
                  />
                  <TouchableOpacity 
                    style={moodStyles.goButton}
                    onPress={handleCustomMood}
                  >
                    <Text style={moodStyles.goButtonText}>Go</Text>
                    <Feather name="chevron-right" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={moodStyles.moodButtonsRow}>
                  <TouchableOpacity 
                    style={moodStyles.moodButton} 
                    onPress={() => setOpenOther(true)}
                  >
                    <Text style={moodStyles.moodButtonText}>Other/Custom</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
      </SafeAreaView>
    </ProtectedRoute>
  )
}

export default Mood