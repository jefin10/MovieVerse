import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerText: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 60,
        marginBottom: 34,
    },
    profileCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 24,
        marginBottom: 34,
        alignItems: 'center',
    },
    profileImageContainer: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 8,
    },
    editInfoContainer: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        marginBottom: 34,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    changePasswordButton: {
        backgroundColor: '#fff', // Blue to match your app's color scheme
        padding: 18,
        borderRadius: 40,
        height: 60,
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    changePasswordButtonText: {
        color: '#000',
        fontSize: 19,
        fontWeight: '600',
    },
    heading: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButtonText: {
        color: '#4F7FFA',
        fontSize: 20,
        marginLeft: 5,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        color: '#AAAAAA',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 18,
        color: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#222',
        borderRadius: 8,
    },
    textInput: {
        fontSize: 18,
        color: '#FFFFFF',
        backgroundColor: '#222',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    saveButton: {
        backgroundColor: '#4F7FFA',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    changePasswordButtonDisabled: {
        backgroundColor: '#335599', 
        opacity: 0.8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButton: {
        backgroundColor: '#fc0303', // Red color for logout
        padding: 18,
        borderRadius: 40,
        height: 60,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 19,
        fontWeight: '600',
    },
    
});

export default styles;