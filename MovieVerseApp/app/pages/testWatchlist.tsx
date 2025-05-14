import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Image, StyleSheet } from 'react-native';
import { PlusCircle, CheckCircle } from 'lucide-react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProtectedRoute from '../auth/protectedRoute';
import api from '@/app/auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TestWatchlist = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingIds, setAddingIds] = useState({});

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      // Get all movies - you may need to adjust the endpoint
      const response = await api.get('api/Trending/');
      setMovies(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError('Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (movieId) => {
  try {
    setAddingIds(prev => ({ ...prev, [movieId]: true }));
    
    const username = await AsyncStorage.getItem('username');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');
    
    if (!username) {
      alert('User not logged in. Please log in first.');
      setAddingIds(prev => ({ ...prev, [movieId]: false }));
      return;
    }
    
    await api.post('api/watchlist/add/', 
      {
        "username": username,
        "movie_id": movieId
      },
      {
        headers: {
          'X-CSRFToken': csrftoken,
          Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`
        }
      }
    );
    
    alert('Added to watchlist!');
  } catch (err) {
    console.error('Failed to add to watchlist:', err);
    alert(`Error: ${err.response?.data?.error || 'Failed to add to watchlist'}`);
  } finally {
    setAddingIds(prev => ({ ...prev, [movieId]: false }));
  }
};
  const renderMovieItem = ({ item }) => (
    <View style={styles.movieCard}>
      <View style={styles.movieImageContainer}>
        {item.poster_url ? (
          <Image 
            source={{ uri: item.poster_url }} 
            style={styles.movieImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.movieImagePlaceholder} />
        )}
      </View>
      
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToWatchlist(item.id)}
          disabled={addingIds[item.id]}
        >
          {addingIds[item.id] ? (
            <ActivityIndicator size="small" color="#FF5500" />
          ) : (
            <>
              <PlusCircle size={18} color="#FF5500" />
              <Text style={styles.addButtonText}>Add to watchlist</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5500" />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchMovies} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <ScreenWrapper>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Test Watchlist</Text>
            <Text style={styles.headerSubtitle}>Add movies to your watchlist</Text>
          </View>
          
          <FlatList
            data={movies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMovieItem}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </ScreenWrapper>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF5500',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  movieCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  movieImageContainer: {
    width: 100,
    height: 150,
    backgroundColor: '#ddd',
  },
  movieImage: {
    width: '100%',
    height: '100%',
  },
  movieImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ddd',
  },
  movieInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF5500',
  },
  addButtonText: {
    color: '#FF5500',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default TestWatchlist;