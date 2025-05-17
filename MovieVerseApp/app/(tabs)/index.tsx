import { ScrollView, StyleSheet, Text, View, TextInput, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { Search, ArrowRight, User, ChevronRight } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {styles} from '@/styles/home'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useRouter } from 'expo-router'
import ProtectedRoute from '../auth/protectedRoute';
import {useAuth} from '../auth/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../auth/api';

// Define the movie type
interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  genres?: string[];
}

const Index = () => {
  const [isOpenOther, setOpenOther] = useState(false);
  const [customMood, setCustomMood] = useState('');
  const [username, setUsername] = useState('');
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { authenticated } = useAuth();
  const router = useRouter();

  const goToProfile = () => {
    console.log('Navigating to ProfilePage');
    router.push('/pages/ProfilePage');
  }

  // Fetch user info and recommendations when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
          fetchRecommendations(storedUsername);
          fetchTrendingMovies();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch recommended movies for the user
  const fetchRecommendations = async (username: string) => {
    try {
      setLoading(true);
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');

      if (!sessionid || !csrftoken) {
        console.warn('Missing authentication tokens');
        return;
      }

      const response = await api.post(
        'api/recommendations/',
        { username },
        {
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
        }
      );
      console.log('Received recommendations:', response.data);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending movies
  const fetchTrendingMovies = async () => {
    try {
      const response = await api.get('api/Trending/');
      setTrendingMovies(response.data);
    } catch (error) {
      console.error('Error fetching trending movies:', error.response?.data || error.message);
    }
  };

  const handleMoodSelection = (mood) => {
    console.log('Selected mood:', mood);
    router.push({
      pathname: '/(tabs)/mood',
      params: { selectedMood: mood }
    });
  }

  const viewMovieDetails = (movie: Movie) => {
    router.push({
      pathname: '/pages/MovieDetailPage',
      params: { movieId: movie.id }
    });
  };
  
  return (
    <ProtectedRoute>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScreenWrapper>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.greetingText}>Good Morning,</Text>
                <Text style={styles.username}>{username}</Text>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <User size={24} color="#fff" onPress={goToProfile} />
              </TouchableOpacity>
            </View>
            
            {/* Search Container */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Movies Here"
                placeholderTextColor="#8a8a8a"
              />
              <TouchableOpacity style={styles.searchButton}>
                <Search size={20} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* Mood Selector */}
            <View style={styles.moodSelector}>
              <Text style={styles.moodTitle}>How are you feeling today?</Text>
              <Text style={styles.moodSubtitle}>Get movies personalized for your mood</Text>
              
              {/* Mood Buttons */}
              {/* ... existing mood buttons code ... */}
              <View style={styles.moodButtonsRow}>
                <TouchableOpacity 
                  style={styles.moodButton}
                  onPress={() => handleMoodSelection('Happy')}
                >
                  <Text style={styles.moodButtonText}>I'm feeling Happy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.moodButton, styles.moodButtonLight]}
                  onPress={() => handleMoodSelection('Sad')}
                >
                  <Text style={[styles.moodButtonText, styles.moodButtonTextDark]}>I'm feeling Sad</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.moodButtonsRow}>
                <TouchableOpacity 
                  style={[styles.moodButton, styles.moodButtonLight]}
                  onPress={() => handleMoodSelection('Romantic')}
                >
                  <Text style={styles.moodButtonTextDark}>I'm feeling Romantic</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.moodButton}
                  onPress={() => handleMoodSelection('Empty')}
                >
                  <Text style={styles.moodButtonText}>I'm feeling Empty</Text>
                </TouchableOpacity>
              </View>

              {/* Custom Mood Input */}
              {isOpenOther ? (
                <View style={styles.customMoodContainer}>
                  <TextInput
                    style={styles.customMoodInput}
                    placeholder="Enter your mood..."
                    placeholderTextColor="#8a8a8a"
                    value={customMood}
                    onChangeText={setCustomMood}
                  />
                  <TouchableOpacity 
                    style={styles.goButton}
                    onPress={() => {
                      if (customMood.trim()) {
                        handleMoodSelection(customMood);
                      }
                      setOpenOther(false);
                    }}
                  >
                    <Text style={styles.goButtonText}>Go</Text>
                    <ChevronRight size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.moodButtonsRow}>
                  <TouchableOpacity style={styles.moodButton} onPress={() => {
                    setOpenOther(true)
                  }}>
                    <Text style={styles.moodButtonText}>Other/Custom</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {/* TOP PICKS (RECOMMENDATIONS) SECTION */}
            <Text style={styles.sectionTitle}>TOP PICKS FOR YOU</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" style={{marginVertical: 20}} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieRow}>
                {recommendations.length > 0 ? (
                  recommendations.map((movie) => (
                    <TouchableOpacity 
                      key={`rec-${movie.id}`} 
                      style={styles.movieCard}
                      onPress={() => viewMovieDetails(movie)}
                    >
                      {movie.poster_url ? (
                        <Image 
                          source={{ uri: movie.poster_url }} 
                          style={styles.movieThumbnail}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.movieThumbnail} />
                      )}
                      <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{color: '#999', marginLeft: 10}}>No recommendations yet</Text>
                )}
              </ScrollView>
            )}

            {/* TRENDING NOW SECTION */}
            <Text style={styles.sectionTitle}>TRENDING NOW</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieRow}>
              {trendingMovies.length > 0 ? (
                trendingMovies.map((movie) => (
                  <TouchableOpacity 
                    key={`trending-${movie.id}`} 
                    style={styles.movieCard}
                    onPress={() => viewMovieDetails(movie)}
                  >
                    {movie.poster_url ? (
                      <Image 
                        source={{ uri: `https://image.tmdb.org/t/p/original/${movie.poster_url}` }} 
                        style={styles.movieThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.movieThumbnail} />
                    )}
                    <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{color: '#999', marginLeft: 10}}>No trending movies available</Text>
              )}
            </ScrollView>

            {/* Weekend Banner */}
            <View style={styles.weekendBanner}>
              <View>
                <Text style={styles.weekendTitle}>Free Weekend?</Text>
                <Text style={styles.weekendSubtitle}>Populate your watchlist for bingewatching</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.swipeText}>Swipe right to find your matches</Text>
                <ArrowRight size={20} color="#fff" />
              </View>
            </View>

            {/* Social Banner */}
            <TouchableOpacity style={styles.socialBanner} onPress={() => {router.push('/pages/TestPage')}}>
              <Text style={styles.socialText}>Find people who have the same taste as you....</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.tabBarSpacer} />
          </ScrollView>
        </SafeAreaView>
      </ScreenWrapper>
    </ProtectedRoute>
  )
}

export default Index