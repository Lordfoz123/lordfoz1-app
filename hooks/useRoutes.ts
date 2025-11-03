import { useAuth } from '@/contexts/AuthContext';
import { RouteService } from '@/services/RouteService';
import { Route } from '@/types/route.types';
import { useEffect, useState } from 'react';

export const useRoutes = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setRoutes([]);
      setLoading(false);
      return;
    }

    console.log('📡 Configurando listener de rutas para usuario:', user.uid);

    const unsubscribe = RouteService.getUserRoutes(
      user.uid,
      (updatedRoutes) => {
        console.log('✅ Rutas actualizadas:', updatedRoutes.length);
        setRoutes(updatedRoutes);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Error al cargar rutas:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔴 Limpiando listener de rutas');
      unsubscribe();
    };
  }, [user]);

  const refresh = async () => {
    console.log('🔄 Refresh solicitado (listener activo)');
  };

  return { routes, loading, error, refresh };
};