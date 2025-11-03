import { AuthProvider } from '@/contexts/AuthContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ✅ Pantalla inicial (splash/loading) */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Grupo de autenticación */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        
        {/* Grupo de tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Detalle de ruta (modal) */}
        <Stack.Screen 
          name="route-detail/[id]" 
          options={{ 
            presentation: 'card',
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}