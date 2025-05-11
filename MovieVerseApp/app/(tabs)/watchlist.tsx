import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Trash2, ChevronDown, Clock } from 'lucide-react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import {styles} from "@/styles//watchlist"
import ProtectedRoute from '../auth/protectedRoute';
const WatchList = () => {
  const [watchlistItems, setWatchlistItems] = useState([
    {
      id: '1',
      title: 'Title',
      ourRating: '4.5/5',
      imdbRating: '8.7/10',
      genre: 'Action, Drama',
      description: 'A compelling story about...'
    },
    {
      id: '2',
      title: 'Title',
      ourRating: '3.9/5',
      imdbRating: '7.8/10',
      genre: 'Thriller, Mystery',
      description: 'An intense journey through...'
    },
    {
      id: '3',
      title: 'Title',
      ourRating: '4.2/5',
      imdbRating: '8.1/10',
      genre: 'Comedy, Romance',
      description: 'A hilarious tale of...'
    },
    {
      id: '4',
      title: 'Title',
      ourRating: '4.2/5',
      imdbRating: '8.1/10',
      genre: 'Comedy, Romance',
      description: 'A hilarious tale of...'
    },
    {
      id: '5',
      title: 'Title',
      ourRating: '4.2/5',
      imdbRating: '8.1/10',
      genre: 'Comedy, Romance',
      description: 'A hilarious tale of...'
    },{
      id: '6',
      title: 'Title',
      ourRating: '4.2/5',
      imdbRating: '8.1/10',
      genre: 'Comedy, Romance',
      description: 'A hilarious tale of...'
    }
  ]);

  const removeFromWatchlist = (id) => {
    setWatchlistItems(watchlistItems.filter(item => item.id !== id));
  };
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
  const renderItem = (data) => (
    <View style={styles.rowFront}>
      <View style={styles.movieItem}>
        <View style={styles.movieImageContainer}>
          <View style={styles.movieImage} />
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
          
          <Text style={styles.movieDetail}>Our Rating: {data.item.ourRating}</Text>
          <Text style={styles.movieDetail}>IMDB Rating: {data.item.imdbRating}</Text>
          <Text style={styles.movieDetail}>Genre: {data.item.genre}</Text>
          <Text style={styles.movieDetail}>Description: {data.item.description}</Text>
        </View>
      </View>
    </View>
  );
  return (
    <ProtectedRoute>
    <ScreenWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Watchlist</Text>
          
         
        </View>

        <SwipeListView
          data={watchlistItems}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          disableRightSwipe
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          contentContainerStyle={styles.scrollContent}
          ListFooterComponent={() => <View style={styles.tabBarSpacer} />}
         
          onRowOpen={(rowKey, rowMap) => {
            removeFromWatchlist(rowKey);
          }}
          
        />
      </SafeAreaView>
    </ScreenWrapper>
    </ProtectedRoute>
  );
};



export default WatchList;