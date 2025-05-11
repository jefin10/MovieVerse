import { useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const ProtectedRoute = ({ children }) => {
  const { authenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authenticated === false && pathname !== '/login') {
      router.replace('../pages/LoginPage');
    }
  }, [authenticated, pathname]);

  if (authenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default ProtectedRoute;
