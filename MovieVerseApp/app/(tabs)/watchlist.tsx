import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import { styles } from "@/styles/watchlist";
import ProtectedRoute from '../auth/protectedRoute';
import api from '@/app/auth/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const WatchList = () => {
  const router = useRouter();
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
  setLoading(true);
  try {
    const username = await AsyncStorage.getItem('username');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');
    
    if (!username) {
      setError('User not logged in. Please log in first.');
      setLoading(false);
      return;
    }
    
    const response = await api.post('api/watchlist/', 
      {
        username: username
      },
      {
        headers: {
          'X-CSRFToken': csrftoken,
          Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`
        }
      }
    );
    
    // Process the response data to ensure complete poster URLs
    const processedData = response.data.map(item => ({
      ...item,
      poster_url: ensureCompleteImageUrl(item.poster_url)
    }));
    
    setWatchlistItems(processedData);
    //console.log('Watchlist items:', processedData);
  } catch (err) {
    console.error('Failed to fetch watchlist:', err);
    setError('Failed to load your watchlist. Please try again.');
  } finally {
    setLoading(false);
  }
};
const ensureCompleteImageUrl = (url) => {
  if (!url) return null;
  
  // If the URL already starts with http/https, it's complete
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path or just the path component from TMDB
  return `https://image.tmdb.org/t/p/w500${url}`;
};
  const removeFromWatchlist = async (id) => {
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'User not logged in. Please log in first.');
        return;
      }
      
      await api.post(`api/watchlist/remove/${id}/`, {
        username: username
      }, {
        headers: {
          'X-CSRFToken': csrftoken,
          Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
        },
      });
      
      // Update local state
      setWatchlistItems(watchlistItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
      Alert.alert('Error', 'Failed to remove movie from watchlist');
    }
  };

  // Render hidden swipe action
  const renderHiddenItem = (data) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => removeFromWatchlist(data.item.id)}
      >
        <Trash2 size={24} color="#fff" />
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Render visible item
  const renderItem = (data) => (
  <TouchableOpacity 
    style={styles.rowFront}
    onPress={() => router.push({
      pathname: '/pages/MovieDetailPage',
      params: { movieId: data.item.movie_id }
    })}
  >
    <View style={styles.movieItem}>
      <View style={styles.movieImageContainer}>
        {data.item.poster_url ? (
          <Image 
            source={{ uri: data.item.poster_url }} 
            style={styles.movieImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.movieImagePlaceholder} />
        )}
      </View>
      
      <View style={styles.movieInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.movieTitle}>{data.item.title}</Text>
          <TouchableOpacity 
            onPress={() => removeFromWatchlist(data.item.id)}
            style={styles.deleteButton}
          >
            <Trash2 size={18} color="#ff5252" />
          </TouchableOpacity>
        </View>
        
        {data.item.genres && (
          <Text style={styles.movieDetail}>
            Genre: {data.item.genres.join(', ')}
          </Text>
        )}
        
        {data.item.description && (
          <Text style={styles.movieDescription} numberOfLines={2}>
            {data.item.description}
          </Text>
        )}
        
        {data.item.added_on && (
          <Text style={styles.dateAdded}>
            Added: {new Date(data.item.added_on).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF5500" />
        <Text style={styles.loadingText}>Loading your watchlist...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchWatchlist} style={styles.retryButton}>
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
            <Text style={styles.headerTitle}>Your Watchlist</Text>
          </View>
          
          {watchlistItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your watchlist is empty</Text>
              <Text style={styles.emptySubtext}>Movies you add to your watchlist will appear here</Text>
            </View>
          ) : (
            <SwipeListView
              data={watchlistItems}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-75}
              disableRightSwipe
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              contentContainerStyle={styles.scrollContent}
              ListFooterComponent={() => <View style={styles.tabBarSpacer} />}
            />
          )}
        </SafeAreaView>
      </ScreenWrapper>
    </ProtectedRoute>
  );
};

export default WatchList;