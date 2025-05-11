import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { UserRound, Edit2 } from 'lucide-react-native'
import styles from '@/styles/profilePage'
import ProtectedRoute from '../auth/protectedRoute';

const ProfilePage = () => {
    const [username, setUsername] = useState('FoxPotato')
    const [email, setEmail] = useState('potato@email.com')
    const [phone, setPhone] = useState('231231223133')
    const [editing, setEditing] = useState(false)

    const handleSave = () => {
        setEditing(false)
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
                    <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => setEditing(!editing)}
                    >
                        <Edit2 size={18} color="#4F7FFA" />
                        <Text style={styles.editButtonText}>
                            {editing ? 'Cancel' : 'Edit'}
                        </Text>
                    </TouchableOpacity>
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
                
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    {editing ? (
                        <TextInput
                            style={styles.textInput}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor="#999"
                        />
                    ) : (
                        <Text style={styles.infoText}>{phone}</Text>
                    )}
                </View>
                
                {editing && (
                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
        </ProtectedRoute>
    )
}

export default ProfilePage