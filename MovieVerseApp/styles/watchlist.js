

import { SafeAreaView, StyleSheet, View } from 'react-native';


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Add to styles object in @/styles/watchlist
dateAdded: {
  fontSize: 12,
  color: '#888',
  marginTop: 4,
},
movieDescription:{
  fontSize: 14,
  color: '#fff',
  opacity: 0.8,
  marginRight: 10,
},
movieImage: {
  width: 90,
  height: 135,
  borderRadius: 8,
},

movieImagePlaceholder: {
  width: 90,
  height: 135,
  backgroundColor: '#333',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
},
refreshButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  justifyContent: 'center',
  alignItems: 'center',
},
// Add to your styles/watchlist.js file
endOfListContainer: {
  alignItems: 'center',
  paddingVertical: 20,
  opacity: 0.7,
},
endOfListDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: '#FFF',
  marginBottom: 8,
},
endOfListText: {
  color: '#FFF',
  fontSize: 12,
  fontWeight: '500',
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
  emptyContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText:{
    fontSize: 18,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptySubtext:{
    fontSize: 14,
    color: '#fff',
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 20,
  },
  centered:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText:{
    fontSize: 18,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText:{
    fontSize: 18,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton:{
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText:{
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  overflow: 'hidden', // Add this to prevent content from overflowing
},
 titleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
  width: '100%', // Ensure the row takes full width of parent
},
  movieTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#fff',
  marginBottom: 4,
  flex: 1, // Allow title to take available space
  paddingRight: 10, // Add padding to prevent text from touching the delete button
},
deleteButton: {
  padding: 6,
  marginLeft: 10, // Add left margin to separate from title
  width: 32, // Fixed width to ensure consistent positioning
  alignItems: 'center', // Center the icon horizontally
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