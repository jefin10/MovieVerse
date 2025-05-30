import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    // Apply font family to specific components instead of using global selector
  
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    greetingText: {
      color: '#fff',
      fontFamily: 'Poppins',
      fontSize: 18,
      opacity: 0.8,
    },
    username: {
      color: '#fff',
      fontSize: 28,
      fontWeight: 'bold',
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#333',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 10,
      color: '#000',
      fontSize: 16,
    },
    searchButton: {
      position: 'absolute',
      right: 10,
      padding: 5,
    },
    moodSelector: {
      backgroundColor: '#111',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    moodTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    moodSubtitle: {
      color: '#999',
      fontSize: 14,
      marginBottom: 12,
    },
    moodButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    moodButton: {
      flex: 1,
      backgroundColor: '#222',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    moodButtonLight: {
      backgroundColor: '#fff',
    },
    customMoodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 8,
      },
      customMoodInput: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 8,
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginRight: 8,
        fontSize: 14,
      },
      goButton: {
        backgroundColor: '#444',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      // Add these to your styles object in @/styles/home.js:

sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  paddingRight: 16,
},
scrollIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.1)',
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 16,
},
scrollText: {
  color: '#ffffff',
  fontSize: 12,
  marginRight: 4,
  opacity: 0.8,
},
      goButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 4,
      },
    moodButtonText: {
      color: '#fff',
      fontWeight: '500',
    },
    moodButtonTextDark: {
      color: '#000',
    },
    sectionTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      marginTop: 8,
    },
    movieRow: {
      marginBottom: 24,
    },
    movieCard: {
      marginRight: 12,
      width: 120,
    },
    movieThumbnail: {
      width: 120,
      height: 160,
      backgroundColor: '#333',
      borderRadius: 8,
      marginBottom: 6,
    },
    movieTitle: {
      color: '#fff',
      fontSize: 14,
    },
    weekendBanner: {
      backgroundColor: '#222',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    weekendTitle: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    weekendSubtitle: {
      color: '#999',
      fontSize: 14,
      marginBottom: 8,
    },
    arrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    swipeText: {
      color: '#fff',
      marginRight: 8,
    },
    socialBanner: {
      backgroundColor: '#222',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    socialText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
      marginRight: 8,
    },
    tabBarSpacer: {
      height: 70,
    },
  });