import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export const useRealTimeLocation = (userId: string | null) => { // ← CAMBIAR A string | null
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null); // ← AGREGAR ERROR

  useEffect(() => {
    // SI NO HAY userId, LIMPIAR TODO
    if (!userId) {
      console.log('🔄 Sin userId, limpiando ubicación');
      setCurrentLocation(null);
      setIsLoading(false);
      setLastUpdate(null);
      setError(null);
      return;
    }

    console.log('🔄 Iniciando suscripción a ubicación en tiempo real para:', userId);
    setIsLoading(true);
    setError(null);
    
    const q = query(
      collection(db, 'locations'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📍 Snapshot recibido, docs:', snapshot.docs.length);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        
        console.log('📍 Nueva ubicación:', data.latitude, data.longitude);
        
        setCurrentLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        
        setLastUpdate(data.timestamp?.toDate() || new Date());
        setError(null); // ← LIMPIAR ERROR EN ÉXITO
      } else {
        console.log('📍 No hay ubicaciones para el usuario:', userId);
        setCurrentLocation(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Error en suscripción:', error);
      setError(`Error de conexión: ${error.message}`); // ← SETEAR ERROR
      setIsLoading(false);
    });

    return () => {
      console.log('🔄 Cerrando suscripción a ubicación');
      unsubscribe();
    };
  }, [userId]);

  return { 
    currentLocation, 
    isLoading, 
    lastUpdate,
    error // ← DEVOLVER ERROR
  };
};