import { hp, wp } from "@/helper/common";
import { StyleSheet } from "react-native";

export const moodStyles = StyleSheet.create({
  // Mood results container
  moodResultContainer: {
    padding: 16,
  },
  resultHeaderContainer: {
    marginBottom: 24,
    borderLeftWidth: 4,
    paddingLeft: 16,
  },
  moodResultTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moodResultSubtitle: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 8,
  },
  movierating: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  
  // Movie grid layout
  movieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieGridItem: {
    width: '48%',
    marginBottom: 20,
  },
  movieImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  
  // Mood controls
  changeMoodButton: {
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  changeMoodGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  changeMoodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Mood selection
  moodSelector: {
    backgroundColor: '#131313',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  
  moodButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
// Update these styles in your existing mood.js file

// Mood selection - flatten buttons
moodSelector: {
  backgroundColor: '#131313',
  borderRadius: 16,
  padding: 20,
  marginBottom: 30,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},

moodButtonsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},

moodButton: {
  flex: 1,
  borderRadius: 10,
  backgroundColor: '#2A2A2A',
  marginHorizontal: 4,
  paddingVertical: 16,
  paddingHorizontal: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},

moodButtonLight: {
  backgroundColor: '#EEEEEE',
},

moodButtonIcon: {
  marginRight: 8,
},

moodButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 15,
},

moodButtonTextDark: {
  color: '#333',
},

// Flatten custom mood input
customMoodContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 4,
  marginBottom: 8,
},

customMoodInput: {
  flex: 1,
  backgroundColor: '#222222',
  borderRadius: 10,
  color: '#fff',
  paddingHorizontal: 16,
  paddingVertical: 14,
  marginRight: 10,
  fontSize: 15,
},

goButton: {
  backgroundColor: '#444',
  borderRadius: 10,
  paddingHorizontal: 20,
  paddingVertical: 14,
  flexDirection: 'row',
  alignItems: 'center',
},

goButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  marginRight: 6,
},

// Flatten change mood button
changeMoodButton: {
  marginTop: 24,
  marginBottom: 24,
  backgroundColor: '#333',
  borderRadius: 10,
  paddingVertical: 14,
  paddingHorizontal: 20,
  alignItems: 'center',
},

changeMoodButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
  
  // Movie display
  movieThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  movieTitle: {
    color: '#fff',
    fontSize: 15,
    marginTop: 6,
    fontWeight: '500',
  },
  
  // General layout
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  
  // Header section
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 10,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    paddingLeft: 16,
  },
  
  // Title styles
  moodTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  
  // Subtitle styles
  moodSubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 18,
    textAlign: 'left',
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingAnimation: {
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Error state
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(50,20,20,0.3)',
    borderRadius: 12,
    padding: 24,
    marginVertical: 20,
  },
  errorText: {
    color: '#ff7777',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});