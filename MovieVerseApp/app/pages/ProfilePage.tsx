import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { UserRound, Edit,ArrowLeft } from 'lucide-react-native'
import styles from '@/styles/profilePage'
import ProtectedRoute from '../auth/protectedRoute';
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../auth/api';

const ProfilePage = () => {
    const router = useRouter()
    const [username, setUsername] = useState('FoxPotato')
    const [email, setEmail] = useState('potato@email.com')
    const [editing, setEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = () => {
        setEditing(false)
    }
   
    const goToResetPassword = async() => {
        console.log('Navigating to Reset Password')
        setIsLoading(true) // Start loading spinner
        
        try {
            const userName = await AsyncStorage.getItem('username')
            console.log(userName)
            
            const res = await api.post('api/auth/forgot-password/', { 
                username: userName 
            })
            
            console.log(res.data)
            router.push('/pages/VerifyOtpPage')
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false) // Stop loading spinner regardless of result
        }
    }

    return (
        <ProtectedRoute>
        <ScrollView style={styles.container}>
             <View style={{
    flexDirection: 'row',
    alignItems: 'center',  // This ensures vertical alignment
    paddingVertical: 20,
    paddingHorizontal: 15,
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
        <ArrowLeft size={24} color="#FFF" />
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
                        <UserRound size={80} color='#FFF' />
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
                            onChangeText={setUsername}
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

            <TouchableOpacity 
                style={[
                    styles.changePasswordButton,
                    isLoading && styles.changePasswordButtonDisabled
                ]} 
                onPress={goToResetPassword}
                disabled={isLoading}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FFF" />
                        <Text style={[styles.changePasswordButtonText, {marginLeft: 10}]}>
                            Sending reset email...
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.changePasswordButtonText}>Change Password</Text>
                )}
            </TouchableOpacity>
             <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={()=>{router.replace('/pages/LogoutPage')}}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            
        </ScrollView>
        </ProtectedRoute>
    )
}

export default ProfilePage