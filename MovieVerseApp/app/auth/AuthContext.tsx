import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  authenticated: boolean | null;
  setAuthenticated: (authenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: null,
  setAuthenticated: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null); 

  useEffect(() => {
    const checkAuth = async () => {
      const sessionid = await AsyncStorage.getItem('sessionid');
      setAuthenticated(!!sessionid);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
