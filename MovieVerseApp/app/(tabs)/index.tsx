import { ScrollView, StyleSheet, Text, View, TextInput, Image, TouchableOpacity, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { Search, ArrowRight, User, ChevronRight } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {styles} from '@/styles/home'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useRouter } from 'expo-router'
import ProtectedRoute from '../auth/protectedRoute';
import {useAuth} from '../auth/AuthContext'
const Index = () => {
  const [isOpenOther,setOpenOther] = useState(false);
  const [customMood, setCustomMood] = useState('')
  
  const { authenticated } = useAuth();
  const router = useRouter()
  const goToProfile = () => {
    console.log('Navigating to ProfilePage')
    router.push('/pages/ProfilePage')
  }
  //   useFocusEffect(
  //   React.useCallback(() => {
  //     if (!authenticated) {
  //       router.replace('/pages/LoginPage'); // or navigation.replace('Login') if using navigation
  //     }
  //   }, [authenticated])
  // );

  return (
    <ProtectedRoute>
   
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <ScreenWrapper>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Good Morning,</Text>
            <Text style={styles.username}>FoxPotato</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <User size={24} color="#fff" onPress={goToProfile} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Movies Here"
            placeholderTextColor="#8a8a8a"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.moodSelector}>
          <Text style={styles.moodTitle}>How are you feeling today?</Text>
          <Text style={styles.moodSubtitle}>Get movies personalized for your mood</Text>
          
          <View style={styles.moodButtonsRow}>
            <TouchableOpacity style={styles.moodButton}>
              <Text style={styles.moodButtonText}>I'm feeling Happy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.moodButton, styles.moodButtonLight]}>
              <Text style={[styles.moodButtonText, styles.moodButtonTextDark]}>I'm feeling Sad</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.moodButtonsRow}>
            <TouchableOpacity style={styles.moodButton}>
              <Text style={styles.moodButtonText}>I'm feeling Romantic</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moodButton}>
              <Text style={styles.moodButtonText}>I'm feeling Empty</Text>
            </TouchableOpacity>
          </View>
          {isOpenOther ?<View style={styles.customMoodContainer}>
              <TextInput
                style={styles.customMoodInput}
                placeholder="Enter your mood..."
                placeholderTextColor="#8a8a8a"
                value={customMood}
                onChangeText={setCustomMood}
              />
              <TouchableOpacity 
                style={styles.goButton}
                onPress={() => {
                  console.log('Custom mood:', customMood);
                  setOpenOther(false);
                }}
              >
                <Text style={styles.goButtonText}>Go</Text>
                <ChevronRight size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          : <View style={styles.moodButtonsRow}>
          <TouchableOpacity style={styles.moodButton} onPress={() => {
            setOpenOther(true)
          }}>
              <Text style={styles.moodButtonText}>Other/Custom</Text>
            </TouchableOpacity>
          </View> }
          
          
        </View>
        <Text style={styles.sectionTitle}>TOP PICKS FOR YOU</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieRow}>
          {[1, 2, 3, 4].map((item) => (
            <View key={`top-${item}`} style={styles.movieCard}>
              <View style={styles.movieThumbnail} />
              <Text style={styles.movieTitle}>Title {item}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>TRENDING NOW</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieRow}>
          {[1, 2, 3, 4].map((item) => (
            <View key={`trending-${item}`} style={styles.movieCard}>
              <View style={styles.movieThumbnail} />
              <Text style={styles.movieTitle}>Title {item}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.weekendBanner}>
          <View>
            <Text style={styles.weekendTitle}>Free Weekend?</Text>
            <Text style={styles.weekendSubtitle}>Populate your watchlist for bingewatching</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.swipeText}>Swipe right to find your matches</Text>
            <ArrowRight size={20} color="#fff" />
          </View>
        </View>
        <TouchableOpacity style={styles.socialBanner} onPress={() => {router.push('/pages/TestPage')}}>
          <Text style={styles.socialText}>Find people who have the same taste as you....</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </SafeAreaView>
    </ScreenWrapper>
       
    </ProtectedRoute>
  )
}

export default Index