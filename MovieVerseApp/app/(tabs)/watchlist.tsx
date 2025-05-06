import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Trash2, ChevronDown, Clock } from 'lucide-react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    color: '#fff',
    marginRight: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  movieItem: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  movieImageContainer: {
    marginRight: 12,
  },
  movieImage: {
    width: 90,
    height: 120,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  movieInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 6,
  },
  movieDetail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  tabBarSpacer: {
    height: 80,
  },
  rowFront: {
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#000',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    flexDirection: 'column',
  },
  backRightBtnRight: {
    backgroundColor: '#ff3b30',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },
});

export default WatchList;