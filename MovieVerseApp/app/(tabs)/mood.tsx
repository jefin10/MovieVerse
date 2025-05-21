import { Text, View, TouchableOpacity, TextInput, ScrollView, Image, StatusBar, ActivityIndicator, SafeAreaView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moodStyles } from '@/styles/mood'
import MovieGrid from '@/components/MovieGrid'
import ProtectedRoute from '../auth/protectedRoute'
import api from '../auth/api';
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
  
  useEffect(() => {
    if (initialMood) {
      getMoodRecommendations(initialMood);
    }
  }, [initialMood]);
  
  const ensureCompleteImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://image.tmdb.org/t/p/w500${url}`;
  };

  const getMoodRecommendations = async (mood) => {
    setLoading(true)
    setError('')
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');
    
    try {
      const response = await api.post('https://mvbackend-6fr8.onrender.com/ai/recommend/', {
        mood: mood
      },
      {
        headers: {
          'X-CSRFToken': csrftoken,
          Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
        },
      });
      
      const genre = response.data.genre || 'Unknown';
      setPredictedGenre(genre);
      
      const processedMovies = response.data.recommendations.map(movie => ({
        ...movie,
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

 const renderMoodButton = (mood, label, alternate = false, icon = null) => (
  <View style={moodStyles.moodButtonsRow}>
    <TouchableOpacity 
      style={[
        moodStyles.moodButton, 
        alternate ? moodStyles.moodButtonLight : null
      ]}
      onPress={() => selectMood(mood)}
    >
      {icon && <Ionicons 
        name={icon} 
        size={20} 
        color={alternate ? '#333' : '#fff'} 
        style={moodStyles.moodButtonIcon} 
      />}
      <Text style={[
        moodStyles.moodButtonText, 
        alternate ? moodStyles.moodButtonTextDark : null
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  </View>
);


  return (
    <ProtectedRoute>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={moodStyles.container}>
          <ScrollView contentContainerStyle={moodStyles.scrollContent} 
          showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={moodStyles.loadingContainer}>
                <View style={moodStyles.loadingAnimation}>
                  <ActivityIndicator size="large" color="#FF5500" />
                </View>
                <Text style={moodStyles.loadingText}>Finding movies for your mood...</Text>
              </View>
            ) : moodAvailable ? (
              <View style={moodStyles.moodResultContainer}>
                <View style={moodStyles.resultHeaderContainer}>
                  <Text style={moodStyles.moodResultTitle}>You're in the mood for {predictedGenre}</Text>
                  <Text style={moodStyles.moodResultSubtitle}>Here are our suggestions</Text>
                </View>
                
                {error ? (
                  <View style={moodStyles.errorContainer}>
                    <Ionicons name="alert-circle" size={32} color="#ff5555" />
                    <Text style={moodStyles.errorText}>{error}</Text>
                  </View>
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
            ) : (
              <>
                <View style={moodStyles.headerSection}>
                  <Text style={moodStyles.moodTitle}>How are you feeling today?</Text>
                  <Text style={moodStyles.moodSubtitle}>Get movies personalized for your mood</Text>
                </View>
                
                <View style={moodStyles.moodSelector}>
                  {renderMoodButton('dramatic movie', 'I\'m feeling Happy', false, 'happy-outline')}
                  {renderMoodButton('comedy', 'I\'m feeling Sad', true, 'sad-outline')}
                  {renderMoodButton('Romantic', 'I\'m feeling Romantic', false, 'heart-outline')}
                  {renderMoodButton('fantasy', 'I\'m feeling Lonely', true, 'person-outline')}
                  {renderMoodButton('Adventurous', 'I\'m feeling Adventurous', false, 'compass-outline')}
                  {renderMoodButton('Action', 'I\'m feeling Bad', true, 'thunderstorm-outline')}
                  
                 {isOpenOther ? (
  <View style={moodStyles.customMoodContainer}>
    <TextInput
      style={moodStyles.customMoodInput}
      placeholder="Enter your mood..."
      placeholderTextColor="#aaaaaa"
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
      <Ionicons 
        name="add-circle-outline" 
        size={20} 
        color="#fff" 
        style={moodStyles.moodButtonIcon} 
      />
      <Text style={moodStyles.moodButtonText}>Other/Custom</Text>
    </TouchableOpacity>
  </View>
)}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  )
}

export default Mood