import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  logo: {
    width: 500,
    height: 500,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between', 
    backgroundColor: '#000000',
    padding: 20,
  },
  buttonLoading: {
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center', 
    paddingTop: 120,
    marginTop: 0,
  },
  signupContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 15,
  marginBottom: 10,
  },
  signupText: {
    color: '#fff',
    fontSize: 16,
  },
  signupLink: {
    color: '#4F7FFA',  
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    color: '#4F7FFA',  
    fontSize: 16,
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 15,
  },
  bottomSection: {
    marginBottom: 30, 
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    fontVariant: ['small-caps'],
    fontFamily: 'Poppins_700Bold',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  form: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    marginLeft: 19,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 40,
    marginBottom: 15,
    backgroundColor: '#111',
  },
  inputContainerFocused: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  input: {
    height: 70,
    paddingHorizontal: 19,
    fontSize: 20,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    height: 65,
    padding: 15,
    borderRadius: 40,
    alignItems: 'center',
    marginTop: 60,
    justifyContent: 'center', 
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 26,
    fontWeight: 'bold',
  },
});

export default styles;