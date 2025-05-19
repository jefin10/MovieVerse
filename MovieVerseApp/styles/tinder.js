const { StyleSheet, Dimensions } = require("react-native");

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        marginTop: 60,
        marginBottom: 10,
        paddingHorizontal: 15
    },
    label: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    swipeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 20,
    },
    label_desc: {
        fontSize: 20,
        color: '#FFFFFF',
        marginRight: 10,
    },
    swiperContainer: {
        flex: 1,
        padding: 0,
        paddingLeft: 20,
    },// Add these styles to your existing styles

    popup: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 1000,
    },
    popupContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    popupText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
    },
    popupMovieTitle: {
        color: '#00FF00',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
    movieCard: {
        width: width - 40,
        height: 650,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        backgroundColor: '#333333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    movieImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end', // Align content to bottom
    },
    movieContentOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
        paddingBottom: 25,
    },
    movieTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    movieDescription: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    movieRating: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    movieOurRating: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    movieGenre: {
        fontSize: 14,
        color: '#CCCCCC',
        marginTop: 5,
    },
    simplifiedPopup: {
        position: 'absolute',
        bottom: 20, // Position at very bottom with small margin
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 1000,
    },
    simplifiedPopupContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    simplifiedPopupText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
    },
  readMoreText: {
    color: '#4F7FFA',  
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 3,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
  },
  noMoviesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  noMoviesText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

module.exports = styles;