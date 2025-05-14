import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { UserRound, Edit2 } from 'lucide-react-native'
import styles from '@/styles/profilePage'
import ProtectedRoute from '../auth/protectedRoute';
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../auth/api';
const ProfilePage = () => {
    const router = useRouter()
    const [username, setUsername] = useState('FoxPotato')
    const [email, setEmail] = useState('potato@email.com')
    const [phone, setPhone] = useState('231231223133')
    const [editing, setEditing] = useState(false)

    const handleSave = () => {
        setEditing(false)
    }
   

    const goToResetPassword = async() => {
        console.log('Navigating to Reset Password')
        const userName= await AsyncStorage.getItem('username')
        console.log(userName)
        api.post('api/auth/forgot-password/', { username: userName })
        .then((res) => {
            console.log(res.data)
            router.push('/pages/VerifyOtpPage')
        })
        .catch((err) => {
            console.log(err)
        })

    }

    return (
        <ProtectedRoute>
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>Profile</Text>
            
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

            <TouchableOpacity style={styles.changePasswordButton} onPress={goToResetPassword}>
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
            </TouchableOpacity>
            
        </ScrollView>
        </ProtectedRoute>
    )
}

export default ProfilePage