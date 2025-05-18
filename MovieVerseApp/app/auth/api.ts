// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://mvbackend-6fr8.onrender.com/', // Update to match your backend IP
  withCredentials: true,
  headers:{
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Initialize the CSRF token if available
AsyncStorage.getItem('csrftoken').then(token => {
  if (token) {
    api.defaults.headers.common['X-CSRFToken'] = token;
  }
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

interface Cookie {
  sessionid?: string;
  csrftoken?: string;
}

export const storeSessionCookie = async (setCookieHeader: string | string[] | undefined): Promise<void> => {
  const cookieString: string = setCookieHeader?.toString() || '';
  const sessionMatch: RegExpMatchArray | null = cookieString.match(/sessionid=([^;]+)/);
  const csrfMatch: RegExpMatchArray | null = cookieString.match(/csrftoken=([^;]+)/);

  if (sessionMatch) {
    await AsyncStorage.setItem('sessionid', sessionMatch[1]);
  }

  if (csrfMatch) {
    await AsyncStorage.setItem('csrftoken', csrfMatch[1]);
    axios.defaults.headers.common['X-CSRFToken'] = csrfMatch[1];
  }
};

export default api;
