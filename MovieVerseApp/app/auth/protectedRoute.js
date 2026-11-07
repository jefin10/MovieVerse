import { useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { color } from '@/ui/tokens';
import { useAuth } from '../auth/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { authenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authenticated === false && pathname !== '/pages/LoginPage' && pathname !== '/pages/RegisterPage' && pathname !== '/pages/VerifyOtpPage') {
      router.replace('../pages/LoginPage');
    }
  }, [authenticated, pathname, router]);

  // Checking the session takes a moment; show the plain background, not a spinner.
  if (authenticated === null) return <View style={{ flex: 1, backgroundColor: color.bg }} />;

  return children;
};

export default ProtectedRoute;
