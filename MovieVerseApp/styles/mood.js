import { hp } from "@/helper/common";
import { StyleSheet } from "react-native";

export const moodStyles = StyleSheet.create({
  // Mood results container
  moodResultContainer: {
    padding: 16,
  },
  moodResultTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moodResultSubtitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 24,
  },
  movierating:{
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
    borderRadius: 8,
  },
  
  // Mood controls
  changeMoodButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  changeMoodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Mood selection
  moodSelector: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    paddingVertical: hp(6),
  },
  moodTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  moodSubtitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 30,
  },
  moodButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  moodButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  moodButtonTextDark: {
    color: '#000',
  },
  
  // Custom mood input
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
  goButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 4,
  },
  
  // Movie display
  movieThumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 6,
    overflow: 'hidden',
  },
  movieTitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  
  // General layout
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#000',
    
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  
  
});