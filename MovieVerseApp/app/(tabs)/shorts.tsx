import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Swipeable } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../auth/api';
import ProtectedRoute from '../auth/protectedRoute';

const { height } = Dimensions.get('window');

type MovieShort = {
  id: number;
  title: string;
  description?: string;
  poster_url?: string;
  trailer_key?: string;
  trailer_url?: string;
  trailer_name?: string;
};

const ITEM_HEIGHT = height - 100;

function Shorts() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MovieShort[]>([]);
  const [activeMovieId, setActiveMovieId] = useState<number | null>(null);

  const fetchShorts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('api/TinderMovies/');
      const movies: MovieShort[] = Array.isArray(response.data) ? response.data : [];

      const withTrailers = movies.filter(
        (movie) => Boolean(movie.trailer_key) || Boolean(movie.trailer_url)
      );

      setItems(withTrailers);
      setActiveMovieId(withTrailers[0]?.id ?? null);
    } catch (error) {
      console.error('Failed to load shorts:', error);
      Alert.alert('Error', 'Failed to load trailer shorts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShorts();
    }, [fetchShorts])
  );

  const addToWatchlist = async (movieId: number) => {
    try {
      const username = await AsyncStorage.getItem('username');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');

      if (!username) {
        Alert.alert('Login required', 'Please login to add to watchlist.');
        return;
      }

      await api.post(
        'api/watchlist/add/',
        {
          username,
          movie_id: movieId,
        },
        {
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
        }
      );

      Alert.alert('Added', 'Movie added to your watchlist.');
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Could not add movie to watchlist.';
      Alert.alert('Error', message);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const id = viewableItems[0]?.item?.id;
      setActiveMovieId(id ?? null);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;

  const renderRightActions = (movie: MovieShort) => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() =>
            router.push({
              pathname: '/pages/MovieDetailPage',
              params: { movieId: movie.id },
            })
          }
        >
          <Feather name="info" size={18} color="#fff" />
          <Text style={styles.actionText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.watchlistButton]}
          onPress={() => addToWatchlist(movie.id)}
        >
          <Feather name="bookmark" size={18} color="#fff" />
          <Text style={styles.actionText}>Watchlist</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: MovieShort }) => {
    const trailerKey = item.trailer_key || (item.trailer_url ? new URL(item.trailer_url).searchParams.get('v') : '');
    const embedUrl = trailerKey
      ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0`
      : null;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
        <View style={styles.card}>
          {embedUrl && activeMovieId === item.id ? (
            <WebView
              source={{ uri: embedUrl }}
              style={styles.video}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
            />
          ) : (
            <View style={styles.fallbackContainer}>
              {item.poster_url ? (
                <Image source={{ uri: item.poster_url }} style={styles.poster} resizeMode="cover" />
              ) : (
                <View style={styles.posterPlaceholder} />
              )}
              <View style={styles.playOverlay}>
                <Feather name="play-circle" size={60} color="#ffffff" />
              </View>
            </View>
          )}

          <View style={styles.captionContainer}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.trailer_name && <Text style={styles.subtitle}>{item.trailer_name}</Text>}
            <Text style={styles.swipeHint}>Swipe left for Details + Watchlist</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff5e00" />
        <Text style={styles.loadingText}>Loading shorts...</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.centered}>
        <Feather name="film" size={30} color="#aaa" />
        <Text style={styles.emptyText}>No trailers available yet.</Text>
        <Text style={styles.emptySubText}>Run TMDB sync to populate trailer data.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      />
    </SafeAreaView>
  );
}

export default function ShortsScreen() {
  return (
    <ProtectedRoute>
      <Shorts />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  emptyText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubText: {
    marginTop: 6,
    color: '#bbb',
  },
  card: {
    height: ITEM_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  poster: {
    flex: 1,
    opacity: 0.8,
  },
  posterPlaceholder: {
    flex: 1,
    backgroundColor: '#222',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: '#ddd',
    fontSize: 13,
  },
  swipeHint: {
    marginTop: 8,
    color: '#ffb17d',
    fontSize: 12,
  },
  actionsContainer: {
    width: 180,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
    backgroundColor: '#101010',
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsButton: {
    backgroundColor: '#2a6fff',
  },
  watchlistButton: {
    backgroundColor: '#ff5e00',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});
