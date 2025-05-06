import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Trash2, ChevronDown, Clock } from 'lucide-react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import ScreenWrapper from '@/components/ScreenWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {styles} from '@/styles/watchlist'

const WatchList = () => {
  const [watchlistItems, setWatchlistItems] = useState([
    {
      id: '1',
      title: 'Inception',
      ourRating: '4.5/5',
      imdbRating: '8.7/10',
      genre: 'Action, Drama',
      description: 'A compelling story about...'
    },
    {
      id: '2',
      title: 'Interstellar',
      ourRating: '3.9/5',
      imdbRating: '7.8/10',
      genre: 'Thriller, Mystery',
      description: 'An intense journey through...'
    },
    {
      id: '3',
      title: 'Jen ',
      ourRating: '4.2/5',
      imdbRating: '8.1/10',
      genre: 'Comedy, Romance',
      description: 'A hilarious tale of...'
    }
  ]);

  const removeFromWatchlist = (id) => {
    setWatchlistItems(watchlistItems.filter(item => item.id !== id));
  };

  // Render the hidden item behind the row (swipe actions)
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

  // Render the visible item
  const renderItem = (data) => (
    <View style={styles.rowFront}>
      <View style={styles.movieItem}>
        <View style={styles.movieImageContainer}>
          <View style={styles.movieImage} />
        </View>
        
        <View style={styles.movieInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.movieTitle}>{data.item.title}</Text>
          </View>
          
          <Text style={styles.movieDetail}>Our Rating: {data.item.ourRating}</Text>
          <Text style={styles.movieDetail}>IMDB Rating: {data.item.imdbRating}</Text>
          <Text style={styles.movieDetail}>Genre: {data.item.genre}</Text>
          <Text style={styles.movieDetail}>Description: {data.item.description}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Watchlist</Text>
          
          
        </View>

        <SwipeListView
          data={watchlistItems}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75} // How far the swipe opens
          disableRightSwipe // Only allow left swipe (which shows right action)
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          contentContainerStyle={styles.scrollContent}
          ListFooterComponent={() => <View style={styles.tabBarSpacer} />}
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
};
export default WatchList;