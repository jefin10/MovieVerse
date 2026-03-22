// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/', // Update to match your backend IP
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
    const cookieHeader = response.headers['set-cookie'] || response.headers['Set-Cookie'];
    const match = cookieHeader?.toString().match(/csrftoken=([^;]+)/);
    if (match) {
      const token = match[1];
      // Set on the local api instance, not global axios
      api.defaults.headers.common['X-CSRFToken'] = token;
      await AsyncStorage.setItem('csrftoken', token);
      return token;
    }
  } catch (err) {
    console.error('Error fetching CSRF token:', err);
  }
};

// Validate session with server
export const validateSession = async (): Promise<boolean> => {
  try {
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');
    
    if (!sessionid) {
      return false;
    }

    const response = await api.get('api/auth/validate-session/', {
      headers: {
        'X-CSRFToken': csrftoken,
        Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
      },
    });

    return response.data.valid === true;
  } catch (err) {
    console.error('Session validation failed:', err);
    return false;
  }
};

// Refresh CSRF token
export const refreshCSRFToken = async (): Promise<string | null> => {
  return await getCSRFToken();
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
    // Set on the local api instance, not global axios
    api.defaults.headers.common['X-CSRFToken'] = csrfMatch[1];
  }
};

// Add response interceptor to handle CSRF token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 403 and CSRF token issue, refresh and retry
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshCSRFToken();
        if (newToken) {
          originalRequest.headers['X-CSRFToken'] = newToken;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh CSRF token:', refreshError);
      }
    }

    // If 401, session expired - clear storage
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['sessionid', 'csrftoken', 'username']);
    }

    return Promise.reject(error);
  }
);

export default api;
