import { StyleSheet } from 'react-native';

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
    padding: 20,
    paddingTop: 60,
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
  bottomSection: {
    marginBottom: 30, 
  },
  title: {
    marginTop: '65%',
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 0,
    fontVariant: ['small-caps'],
    fontFamily: 'Poppins_700Bold',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
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
    marginTop: 40,
    justifyContent: 'center', 
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 26,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
  },
  loginLink: {
    color: '#fff',  
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;