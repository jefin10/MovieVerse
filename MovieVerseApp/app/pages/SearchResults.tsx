import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import api from '../auth/api';

interface Movie {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  imdb_rating?: number;
  genres?: string[];
  release_date?: string;
}

export default function SearchResults() {
  const { query } = useLocalSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchMovies(query as string);
    }
  }, [query]);

  const searchMovies = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await api.get(`api/searchMovie/${encodeURIComponent(searchQuery)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewMovieDetails = (movie: Movie) => {
    router.push({
      pathname: '/pages/MovieDetailPage',
      params: { movieId: movie.id }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <View style={{width: 24}} /> 
      </View>
      
      {/* Search query info */}
      <Text style={styles.searchInfo}>Results for "{query}"</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      ) : (
        results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.resultItem}
                onPress={() => viewMovieDetails(item)}
              >
                {item.poster_url ? (
                  <Image 
                    source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_url}` }} 
                    style={styles.posterImage}
                  />
                ) : (
                  <View style={styles.noPoster} />
                )}
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle}>{item.title}</Text>
                  {item.release_date && (
                    <Text style={styles.releaseDate}>{item.release_date.split('-')[0]}</Text>
                  )}
                  {item.imdb_rating && (
                    <Text style={styles.rating}>⭐ {item.imdb_rating.toFixed(1)}</Text>
                  )}
                  {item.description && (
                    <Text numberOfLines={2} style={styles.description}>
                      {item.description}
                    </Text>
                  )}
                  {item.genres && (
                    <Text style={styles.genres}>
                      {item.genres.slice(0, 3).join(' · ')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No movies found matching "{query}"</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  description:{
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4
  },
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingTop: 50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  searchInfo: {
    fontSize: 16,
    color: '#CCCCCC',
    marginHorizontal: 16,
    marginBottom: 20
  },
  resultsList: {
    paddingHorizontal: 16
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 10,
    overflow: 'hidden'
  },
  posterImage: {
    width: 100,
    height: 150
  },
  noPoster: {
    width: 100,
    height: 150,
    backgroundColor: '#333333'
  },
  movieInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center'
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4
  },
  releaseDate: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4
  },
  rating: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 4
  },
  genres: {
    fontSize: 14,
    color: '#AAAAAA'
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  noResultsText: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});