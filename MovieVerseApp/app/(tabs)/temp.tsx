// import React, { useEffect } from 'react';
// import { View, Text } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../auth/api';

// const Temp = () => {
//   useEffect(() => {
//     const triggerApi = async () => {
//       try {
//         const sessionid = await AsyncStorage.getItem('sessionid');
//         const csrftoken = await AsyncStorage.getItem('csrftoken');
//         const username = await AsyncStorage.getItem('username');

//         if (!sessionid || !csrftoken || !username) {
//           console.warn('Missing session/token/username');
//           return;
//         }

//         const response = await api.post(
//           'api/recommendations/temp-add/',
//           {
//             username: username,
//           },
//           {
//             headers: {
//               'X-CSRFToken': csrftoken,
//               Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
//             },
//           }
//         );

//         console.log('Response:', response.data);
//       } catch (error) {
//         console.log('API error:', error
//         );
//       }
//     };

//     triggerApi();
//   }, []);

//   return (
//     <View style={{ padding: 16 }}>
//       <Text style={{ fontSize: 20 }}>Hello</Text>
//     </View>
//   );
// };

// export default Temp;
