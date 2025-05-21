import { ScrollView, StyleSheet, Text, View, TextInput, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
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
  const [search, setSearch] = useState('');
  const [greeting, setGreeting] = useState('');

  
  
  const { authenticated } = useAuth();
  const router = useRouter();

  const goToProfile = () => {
    router.push('/pages/ProfilePage');
  }
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good Morning,';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good Afternoon,';
    } else {
      return 'Good Evening,';
    }
  };

  // Fetch user info and recommendations when component mounts
    useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Set the greeting when the component mounts
        setGreeting(getGreeting());
        
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
    
    // Update greeting every minute in case user stays on screen across time boundaries
    const greetingInterval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(greetingInterval);
  }, []);

  // Fetch recommended movies for the user
  // Modify the fetchRecommendations function
const fetchRecommendations = async (username: string) => {
  const sessionid = await AsyncStorage.getItem('sessionid');
  const csrftoken = await AsyncStorage.getItem('csrftoken');
  try {
    setLoading(true);
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');

    if (!sessionid || !csrftoken) {
      console.warn('Missing authentication tokens');
      return;
    }

    // Call the new endpoint that uses ratings to generate recommendations
    const response = await api.get(
      'api/recommendations/from-ratings/',
      {
        headers: {
          'X-CSRFToken': csrftoken,
          Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
        },
        params: { username }
      }
    );

    
    // Process poster URLs to ensure they're complete
    const processedMovies = response.data.recommendations.map(movie => ({
      ...movie,
      poster_url: movie.poster_url ? (
        movie.poster_url.startsWith('http') ? 
          movie.poster_url : 
          `https://image.tmdb.org/t/p/w500${movie.poster_url}`
      ) : null
    }));
    
    setRecommendations(processedMovies);
  } catch (error) {
    console.error('Error fetching recommendations:', error.response?.data || error.message);
    // Fall back to the original recommendations endpoint if the new one fails
    try {
      const fallbackResponse = await api.post(
        'api/recommendations/',
        { username },
        {
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
        }
      );
      setRecommendations(fallbackResponse.data);
    } catch (fallbackError) {
      console.error('Error with fallback recommendations:', fallbackError);
    }
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

  const handleSearch = async (query: string) => {
  if (!query.trim()) return;
  
    try {
      // Navigate to search results page with the query parameter
      router.push({
        pathname: '/pages/SearchResults',
        params: { query: query.trim() }
      });
    } catch (error) {
      console.error('Error handling search:', error);
    }
  };
  
  return (
    <ProtectedRoute>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScreenWrapper>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.greetingText}>{greeting}</Text>
                <Text style={styles.username}>{username}</Text>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <Feather name="user" size={24} color="#fff" onPress={goToProfile} />
              </TouchableOpacity>
            </View>
            
            {/* Search Container */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Movies Here"
                placeholderTextColor="#8a8a8a"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(search)}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => handleSearch(search)}
              >
                <Feather name="search" size={20} color="#000" />
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
                  onPress={() => handleMoodSelection('drama')}
                >
                  <Text style={styles.moodButtonText}>I'm feeling Happy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.moodButton, styles.moodButtonLight]}
                  onPress={() => handleMoodSelection('comedy')}
                >
                  <Text style={[styles.moodButtonText, styles.moodButtonTextDark]}>I'm feeling Sad</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.moodButtonsRow}>
                <TouchableOpacity 
                  style={[styles.moodButton, styles.moodButtonLight]}
                  onPress={() => handleMoodSelection('Romantic')}
                >
                  <Text  style={[styles.moodButtonText, styles.moodButtonTextDark]}>I'm feeling Love</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.moodButton}
                  onPress={() => handleMoodSelection('action')}
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
                    <Feather name="chevron-right" size={16} color="#fff" />
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
            {/* TOP PICKS (RECOMMENDATIONS) SECTION */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TOP PICKS FOR YOU</Text>
              <View style={styles.scrollIndicator}>
                <Feather name="chevron-right" size={18} color="#ffffff" />
              </View>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" style={{marginVertical: 20}} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieRow}>
                {recommendations.length > 0 ? (
                  recommendations.map((movie, index) => (
                    <TouchableOpacity 
                      key={`rec-${movie.id}-${index}`} // Added index to ensure uniqueness
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
                  <Text style={{color: '#999', marginLeft: 10}}>
                    Rate some movies to get personalized recommendations!
                  </Text>
                )}
              </ScrollView>
            )}
           <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRENDING NOW</Text>
            <View style={styles.scrollIndicator}>
              <Feather name="chevron-right" size={18} color="#ffffff" />
            </View>
          </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieRow}>
              {trendingMovies.length > 0 ? (
                trendingMovies.map((movie, index) => (
                  <TouchableOpacity 
                    key={`trending-${movie.id}-${index}`} // Added index to ensure uniqueness
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
            <TouchableOpacity onPress={()=>{router.push('/(tabs)/tinder')}} style={styles.weekendBanner}>
              <View>
                <Text style={styles.weekendTitle}>Free Weekend?</Text>
                <Text style={styles.weekendSubtitle}>Populate your watchlist for bingewatching</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.swipeText}>Swipe right to find your matches</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.tabBarSpacer} />
          </ScrollView>
        </SafeAreaView>
      </ScreenWrapper>
    </ProtectedRoute>
  )
}

export default Index