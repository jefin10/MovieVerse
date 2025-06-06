import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
      alignItems: 'center',
      justifyContent: 'space-between', 
      paddingVertical: 50, 
    },
    mainContent: {
      flex: 1, 
      alignItems: 'center',
      justifyContent: 'center', 
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginTop: 40, 
      
    },
    squareContainer: {
      width: 140,
      height: 140,
      marginTop: 120,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    square: {
      width: 140,
      height: 140,
      backgroundColor: '#999999',
      position: 'absolute',
      transform: [{ rotate: '45deg' }], // Rotation is back
      overflow: 'hidden',
    },
    // Add this to your styles
messageContainer: {
  height: 25, // Fixed height to reserve space
  justifyContent: 'center',
  marginTop: 10,
  marginBottom: 5,
},
loadingMessage: {
  color: '#898989', // Orange/amber for attention
  fontSize: 14,
  textAlign: 'center',
  fontStyle: 'italic',
},
    fill: {
      position: 'absolute',
      bottom: 0,
      left: -20,
      right: 0, 
      backgroundColor: '#FFFFFF',
      transform: [{ rotate: '-45deg' }, { scale: 1.5 }, { translateY: 60 }], // Counter-rotate and scale to ensure full coverage
    },
    rotate: {
      fontSize: 90,
      zIndex: 2,
      //transform: [{ rotate: '-45deg' }], // Counter-rotate text to appear straight
    },
    factContainer: {
      width: '95%',
      alignItems: 'center',
      marginBottom: 30, 
      padding: 15,
    },
    factTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 10,
      textAlign: 'center',
    },
    factText: {
      fontSize: 16,
      color: '#CCCCCC',
      textAlign: 'center',
      lineHeight: 24,
    }
  })

export default styles;