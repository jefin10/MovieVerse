import { Text, View, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { moodStyles } from '@/styles/mood'
import MovieGrid from '@/components/MovieGrid'

const Mood = () => {
  const router = useRouter();
  const [moodAvailable, setMoodAvailable] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [isOpenOther, setOpenOther] = useState(false);
  const [customMood, setCustomMood] = useState('');

  const selectMood = (mood) => {
    setSelectedMood(mood);
    setMoodAvailable(true);
  };

  const handleCustomMood = () => {
    if (customMood.trim()) {
      selectMood(customMood);
    }
    setOpenOther(false);
  };

  return (
    <View style={moodStyles.container}>
      <ScrollView contentContainerStyle={moodStyles.scrollContent}>
        {moodAvailable ? (
          <View style={moodStyles.moodResultContainer}>
            <Text style={moodStyles.moodResultTitle}>You are currently in the mood for {selectedMood}</Text>
            <Text style={moodStyles.moodResultSubtitle}>Here are our suggestions</Text>

            <MovieGrid mood={selectedMood} />

            <TouchableOpacity 
              style={moodStyles.changeMoodButton}
              onPress={() => setMoodAvailable(false)}
            >
              <Text style={moodStyles.changeMoodButtonText}>Change Mood</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={moodStyles.moodSelector}>
            <Text style={moodStyles.moodTitle}>How are you feeling today?</Text>
            <Text style={moodStyles.moodSubtitle}>Get movies personalized for your mood</Text>
            
            <View style={moodStyles.moodButtonsRow}>
              <TouchableOpacity 
                style={moodStyles.moodButton}
                onPress={() => selectMood('Happy')}
              >
                <Text style={moodStyles.moodButtonText}>I'm feeling Happy</Text>
              </TouchableOpacity>
              
            </View>
            <View style={moodStyles.moodButtonsRow}>
            <TouchableOpacity 
                style={[moodStyles.moodButton, moodStyles.moodButtonLight]}
                onPress={() => selectMood('Sad')}
              >
                <Text style={[moodStyles.moodButtonText, moodStyles.moodButtonTextDark]}>I'm feeling Sad</Text>
              </TouchableOpacity>
            </View>
            <View style={moodStyles.moodButtonsRow}>
            <TouchableOpacity 
                style={moodStyles.moodButton}
                onPress={() => selectMood('Romantic')}
              >
                <Text style={moodStyles.moodButtonText}>I'm feeling Romantic</Text>
              </TouchableOpacity>
            </View>
            <View style={moodStyles.moodButtonsRow}>
            <TouchableOpacity 
                style={[moodStyles.moodButton, moodStyles.moodButtonLight]}
                onPress={() => selectMood('Sad')}
              >
                <Text style={[moodStyles.moodButtonText, moodStyles.moodButtonTextDark]}>I'm feeling Lonely</Text>
              </TouchableOpacity>
            </View>
            <View style={moodStyles.moodButtonsRow}>
              
              <TouchableOpacity 
                style={moodStyles.moodButton}
                onPress={() => selectMood('Horror')}
              >
                <Text style={moodStyles.moodButtonText}>I'm feeling Adventurous</Text>
              </TouchableOpacity>
            </View>
            <View style={moodStyles.moodButtonsRow}>
            <TouchableOpacity 
                style={[moodStyles.moodButton, moodStyles.moodButtonLight]}
                onPress={() => selectMood('Sad')}
              >
                <Text style={[moodStyles.moodButtonText, moodStyles.moodButtonTextDark]}>I'm feeling Bad</Text>
              </TouchableOpacity>
            </View>
            {isOpenOther ? (
              <View style={moodStyles.customMoodContainer}>
                <TextInput
                  style={moodStyles.customMoodInput}
                  placeholder="Enter your mood..."
                  placeholderTextColor="#8a8a8a"
                  value={customMood}
                  onChangeText={setCustomMood}
                />
                <TouchableOpacity 
                  style={moodStyles.goButton}
                  onPress={handleCustomMood}
                >
                  <Text style={moodStyles.goButtonText}>Go</Text>
                  <ChevronRight size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={moodStyles.moodButtonsRow}>
                <TouchableOpacity 
                  style={moodStyles.moodButton} 
                  onPress={() => setOpenOther(true)}
                >
                  <Text style={moodStyles.moodButtonText}>Other/Custom</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default Mood