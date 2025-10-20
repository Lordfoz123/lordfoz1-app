import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      console.log('⏳ Cargando estado de autenticación...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    console.log('🔄 Verificando navegación...');
    console.log('Usuario autenticado:', user ? user.email : 'No');
    console.log('Segmentos actuales:', segments);
    console.log('En grupo auth:', inAuthGroup);

    if (user && !loading) {
      console.log('✅ Usuario autenticado, redirigiendo a (tabs)');
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else if (!user && !loading) {
      console.log('❌ Usuario no autenticado, redirigiendo a (auth)');
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}