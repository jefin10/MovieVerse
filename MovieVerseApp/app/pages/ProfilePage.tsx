import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState,useEffect } from 'react'
import { Feather } from '@expo/vector-icons';
import styles from '@/styles/profilePage'
import ProtectedRoute from '../auth/protectedRoute';
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../auth/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfilePage = () => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [editing, setEditing] = useState(false)

    const handleSave = () => {
        setEditing(false)
    }

    useEffect(()=>{
        const getUsername=async()=>{
            try {
                const res=await AsyncStorage.getItem('username')
                if (res) setUsername(res)
                const result = await api.get('api/auth/getEmail/')
                setEmail(result.data.email)
            } catch (error) {
                console.warn('Failed to load profile info:', error)
            }
        }

        getUsername()
    },[])
   
    return (
        <ProtectedRoute>
        <SafeAreaView style={{flex: 1, backgroundColor: '#000',paddingVertical:20}}>
        <ScrollView style={styles.container}
        showsVerticalScrollIndicator={false}
        >
             <View style={{
                flexDirection: 'row',
                alignItems: 'center',  // This ensures vertical alignment
                paddingVertical: 20,
                paddingTop: 0,
                paddingHorizontal: 0,
                marginBottom: 15
            }}>
    <TouchableOpacity 
        style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 20,
            padding: 8,
            marginRight: 15
        }}
        onPress={() => router.back()}
    >
        <Feather name="arrow-left" size={24} color="#FFF" />
    </TouchableOpacity>
    
    {/* Adjust the Text component to better align with the back button */}
    <Text style={{
        color: '#FFF',
        fontSize: 24, 
        fontWeight: 'bold',
        marginBottom: 0,
        paddingBottom: 0,
        lineHeight: 28
    }}>Profile</Text>
</View>
            
            <View style={styles.profileCard}>
                <View style={styles.profileImageContainer}>
                    <View style={styles.avatarContainer}>
                        <Feather name="user" size={80} color="#FFF" />
                    </View>
                    <Text style={styles.username}>{username}</Text>
                </View>
            </View>
            <View style={styles.editInfoContainer}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.heading}>Personal Information</Text>
                    
                </View>
                
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Username</Text>
                    {editing ? (
                        <TextInput
                            style={styles.textInput}
                            value={username}
                            placeholderTextColor="#999"
                        />
                    ) : (
                        <Text style={styles.infoText}>{username}</Text>
                    )}
                </View>
                
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email</Text>
                    {editing ? (
                        <TextInput
                            style={styles.textInput}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor="#999"
                        />
                    ) : (
                        <Text style={styles.infoText}>{email}</Text>
                    )}
                </View>
            </View>

            {[
                { icon: 'tv', label: 'Streaming services & alerts', route: '/pages/PreferencesPage' },
                { icon: 'users', label: 'Friends', route: '/pages/FriendsPage' },
                { icon: 'bell', label: 'Notifications', route: '/pages/NotificationsPage' },
            ].map((row) => (
                <TouchableOpacity
                    key={row.route}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#141414', borderRadius: 14, padding: 15, marginBottom: 10 }}
                    onPress={() => router.push(row.route as any)}
                >
                    <Feather name={row.icon as any} size={20} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 15, flex: 1 }}>{row.label}</Text>
                    <Feather name="chevron-right" size={18} color="#777" />
                </TouchableOpacity>
            ))}

             <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={()=>{router.replace('/pages/LogoutPage')}}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            
        </ScrollView>
        </SafeAreaView>
        </ProtectedRoute>
    )
}

export default ProfilePage
