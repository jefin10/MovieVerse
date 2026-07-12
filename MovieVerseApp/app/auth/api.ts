// Minimal API client for the MovieVerse Node backend (JWT auth via Bearer token).
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = (  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://movieversebackend.jefin.xyz/'  )?.trim();


console.log('[api] Base URL:', API_BASE_URL);

const TOKEN_KEY = 'authToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const saveAuthToken = (token?: string | null) =>
  token ? AsyncStorage.setItem(TOKEN_KEY, token) : Promise.resolve();

// Clear the stored session (logout or expired token).
export const clearAuth = () => AsyncStorage.multiRemove([TOKEN_KEY, 'username']);

// True when we hold a token the server still accepts.
export const validateSession = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const { data } = await api.get('api/auth/validate-session/');
    return data?.valid === true;
  } catch (err: any) {
    return !err?.response;
  }
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) await clearAuth();
    return Promise.reject(error);
  },
);

export default api;
