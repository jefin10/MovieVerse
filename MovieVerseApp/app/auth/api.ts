// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URLS = [
  'https://movieversebackend.jefin.xyz/',
  'http://51.20.60.134/',
];

let activeBaseUrlIndex = 0;
let csrfFetchPromise: Promise<string | null> | null = null;

const api = axios.create({
  baseURL: API_BASE_URLS[activeBaseUrlIndex],
  withCredentials: true,
  timeout: 12000,
  headers:{
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

const switchToNextBaseURL = (): boolean => {
  const nextIndex = activeBaseUrlIndex + 1;
  if (nextIndex >= API_BASE_URLS.length) {
    return false;
  }

  activeBaseUrlIndex = nextIndex;
  api.defaults.baseURL = API_BASE_URLS[activeBaseUrlIndex];
  console.warn('Switched API base URL to:', api.defaults.baseURL);
  return true;
};


// Initialize the CSRF token if available
AsyncStorage.getItem('csrftoken').then(token => {
  if (token) {
    api.defaults.headers.common['X-CSRFToken'] = token;
  }
});

export const getCSRFToken = async () => {
  const cachedToken = await AsyncStorage.getItem('csrftoken');
  if (cachedToken) {
    api.defaults.headers.common['X-CSRFToken'] = cachedToken;
    return cachedToken;
  }

  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  csrfFetchPromise = (async () => {
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
      return null;
    } catch (err) {
      console.warn('Error fetching CSRF token:', err);
      return null;
    } finally {
      csrfFetchPromise = null;
    }
  })();

  return csrfFetchPromise;
};

// Validate session with server
export const validateSession = async (): Promise<boolean> => {
  try {
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');
    
    if (!sessionid) {
      return false;
    }

    const cookie = csrftoken
      ? `sessionid=${sessionid}; csrftoken=${csrftoken}`
      : `sessionid=${sessionid}`;

    const response = await api.get('api/auth/validate-session/', {
      headers: {
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        Cookie: cookie,
      },
    });

    return response.data.valid === true;
  } catch (err: any) {
    // Keep existing session on transient network failures.
    if (!err?.response) {
      console.warn('Session validation skipped due network issue.');
      return true;
    }

    console.warn('Session validation failed:', err);
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

// Attach stored session/csrf credentials to every request for RN cookie handling.
api.interceptors.request.use(
  async (config) => {
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrftoken = await AsyncStorage.getItem('csrftoken');

    config.headers = config.headers || {};
    config.baseURL = api.defaults.baseURL;

    if (csrftoken && !config.headers['X-CSRFToken']) {
      config.headers['X-CSRFToken'] = csrftoken;
    }

    if (sessionid && !config.headers['Cookie']) {
      config.headers['Cookie'] = csrftoken
        ? `sessionid=${sessionid}; csrftoken=${csrftoken}`
        : `sessionid=${sessionid}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle CSRF token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED';
      const requestUrl: string = originalRequest?.url || '';
      const noisyAuthProbe = requestUrl.includes('api/auth/csrf/') || requestUrl.includes('api/auth/validate-session/');

      if (!noisyAuthProbe) {
        console.warn(isTimeout ? 'Request timed out:' : 'Network error:', error.message);
      }

      // Try next base URL once for network-level failures.
      if (originalRequest && !originalRequest._baseRetried && switchToNextBaseURL()) {
        originalRequest._baseRetried = true;
        return api(originalRequest);
      }
    }

    // If 403 and CSRF token issue, refresh and retry
    if (error.response?.status === 403 && originalRequest && !originalRequest._retry) {
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
