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
  title: {
    marginTop: '45%',
    fontSize: 48,
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
  bottomSection: {
    marginBottom: 30, 
  },
  form: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
    color: '#fff',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
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
  inputContainerValid: {
    borderColor: '#00cc66', 
    borderWidth: 2,
  },
  inputContainerInvalid: {
    borderColor: '#ff3333', 
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
    marginBottom: 15,
  },
  buttonLoading: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    color: '#000',
    fontSize: 26,
    fontWeight: 'bold',
  },
  cancelButton: {
    height: 50,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
  invalidMessage: {
    color: '#ff4d4d',
    fontSize: 14,
    marginLeft: 20,
    marginTop: -10,
    marginBottom: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
export default styles;