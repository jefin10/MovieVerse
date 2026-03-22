import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateSession } from './api';

interface AuthContextType {
  authenticated: boolean | null;
  setAuthenticated: (authenticated: boolean) => void;
  revalidateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: null,
  setAuthenticated: () => {},
  revalidateSession: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null); 

  const revalidateSession = async () => {
    try {
      const isValid = await validateSession();
      setAuthenticated(isValid);
      
      if (!isValid) {
        // Clear invalid session
        await AsyncStorage.multiRemove(['sessionid', 'csrftoken', 'username']);
      }
    } catch (error) {
      console.error('Session revalidation failed:', error);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const sessionid = await AsyncStorage.getItem('sessionid');
      
      if (!sessionid) {
        setAuthenticated(false);
        return;
      }

      // Validate session with server
      await revalidateSession();
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, revalidateSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
