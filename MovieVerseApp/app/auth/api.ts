// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.1.2:8000/', // Update to match your backend IP
  withCredentials: true,
});

export const getCSRFToken = async () => {
  try {
  
    const response = await api.get('api/auth/csrf/');
;
    const cookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
    const match = cookieHeader?.toString().match(/csrftoken=([^;]+)/);
    if (match) {
      
      const token = match[1];
      axios.defaults.headers.common['X-CSRFToken'] = token;
      await AsyncStorage.setItem('csrftoken', token);
      return token;
    }
  } catch (err) {
    console.error('Error fetching CSRF token:', err);
  }
};

export const storeSessionCookie = async (setCookieHeader) => {
  const cookieString = setCookieHeader?.toString();
  const sessionMatch = cookieString.match(/sessionid=([^;]+)/);
  const csrfMatch = cookieString.match(/csrftoken=([^;]+)/);

  if (sessionMatch) {
    await AsyncStorage.setItem('sessionid', sessionMatch[1]);
  }

  if (csrfMatch) {
    await AsyncStorage.setItem('csrftoken', csrfMatch[1]);
    axios.defaults.headers.common['X-CSRFToken'] = csrfMatch[1];
  }
};

export default api;
