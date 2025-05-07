import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 60,
        marginBottom: 24,
    },
    profileCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
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
        marginBottom: 30,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    heading: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButtonText: {
        color: '#4F7FFA',
        fontSize: 16,
        marginLeft: 5,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
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
});

export default styles;