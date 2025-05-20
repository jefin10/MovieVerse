import { StyleSheet, Dimensions, Platform } from 'react-native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Determine if the device is a tablet
const isTablet = width > 600;

// Create a better scaling function that works for all device sizes
const scale = (size) => {
  const baseSize = isTablet ? size * 1.3 : size;
  return Math.round(baseSize * (width / 375)); // Scale based on device width compared to iPhone 8
};

const styles = StyleSheet.create({
  
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  inner: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: scale(24),
    paddingTop: scale(10), // Added a small top padding
    paddingBottom: scale(20),
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: scale(0), // Added positive margin to move logo down
    // Still keeping the negative bottom margin to reduce gap between logo and content
    marginBottom: scale(-100), 
  },
  logo: {
    // Keeping your large logo size
    width: scale(380),
    height: scale(380),
    resizeMode: 'contain',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: scale(0),
    // Add a negative top margin to pull this section closer to the logo
    marginTop: scale(-20), // This further reduces the gap
  },
  title: {
    fontSize: scale(30),
    fontWeight: 'bold',
    capitalize: 'uppercase',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: scale(10), // Slightly reduced from 15
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  form: {
    backgroundColor: '#000',
    borderRadius: scale(20),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    marginTop: scale(5), // This will position the form closer to the title
  },
  bottomSection: {
    marginBottom: scale(15),
  },
  label: {
    fontSize: scale(16),
    marginBottom: scale(6),
    marginLeft: scale(16),
    color: '#FFFFFF',
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: scale(30),
    marginBottom: scale(15),
    backgroundColor: '#111',
  },
  inputContainerFocused: {
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
  },
  input: {
    height: scale(55),
    paddingHorizontal: scale(18),
    fontSize: scale(16),
    color: '#fff',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: scale(15),
  },
  signupText: {
    color: '#fff',
    fontSize: scale(14),
  },
  signupLink: {
    color: '#4F7FFA',
    fontSize: scale(14),
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    color: '#4F7FFA',
    fontSize: scale(14),
    alignSelf: 'flex-end',
    marginVertical: scale(8),
  },
  button: {
    backgroundColor: '#fff',
    height: scale(55),
    borderRadius: scale(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(18),
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: '#000',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  buttonLoading: {
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
});

export default styles;