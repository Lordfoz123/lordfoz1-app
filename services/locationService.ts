import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';

export interface LocationData {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

/**
 * Guardar ubicación en Firestore
 * Se guarda cada vez que el GPS detecta movimiento
 */
export const saveLocation = async (locationData: LocationData) => {
  try {
    const docRef = await addDoc(collection(db, 'locations'), {
      ...locationData,
      timestamp: Timestamp.fromDate(locationData.timestamp),
      createdAt: Timestamp.now(),
    });
    
    console.log('📍 Ubicación guardada en Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error guardando ubicación:', error);
    throw error;
  }
};

/**
 * Obtener últimas ubicaciones de un usuario específico
 * @param userId - ID del usuario
 * @param limitCount - Número máximo de ubicaciones a obtener (default: 50)
 */
export const getUserLocations = async (userId: string, limitCount: number = 50) => {
  try {
    const q = query(
      collection(db, 'locations'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const locations: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      locations.push({
        id: doc.id,
        ...data,
        // Convertir Timestamp de Firebase a Date
        timestamp: data.timestamp?.toDate(),
        createdAt: data.createdAt?.toDate(),
      });
    });
    
    console.log(`📍 Obtenidas ${locations.length} ubicaciones para usuario ${userId}`);
    return locations;
  } catch (error) {
    console.error('❌ Error obteniendo ubicaciones:', error);
    throw error;
  }
};

/**
 * Obtener la última ubicación registrada de un usuario
 * @param userId - ID del usuario
 */
export const getLastLocation = async (userId: string) => {
  try {
    const locations = await getUserLocations(userId, 1);
    return locations[0] || null;
  } catch (error) {
    console.error('❌ Error obteniendo última ubicación:', error);
    throw error;
  }
};

/**
 * Obtener ubicaciones de un usuario en un rango de fechas
 * @param userId - ID del usuario
 * @param startDate - Fecha inicial
 * @param endDate - Fecha final
 */
export const getUserLocationsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const q = query(
      collection(db, 'locations'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const locations: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      locations.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate(),
        createdAt: data.createdAt?.toDate(),
      });
    });
    
    console.log(`📍 Obtenidas ${locations.length} ubicaciones entre ${startDate} y ${endDate}`);
    return locations;
  } catch (error) {
    console.error('❌ Error obteniendo ubicaciones por rango de fechas:', error);
    throw error;
  }
};

/**
 * Obtener todas las ubicaciones de hoy de un usuario
 * @param userId - ID del usuario
 */
export const getTodayLocations = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Inicio del día
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1); // Fin del día
  
  return getUserLocationsByDateRange(userId, today, tomorrow);
};

/**
 * Calcular distancia total recorrida entre ubicaciones (en kilómetros)
 * Usa la fórmula de Haversine
 */
export const calculateTotalDistance = (locations: LocationData[]): number => {
  if (locations.length < 2) return 0;
  
  let totalDistance = 0;
  
  for (let i = 0; i < locations.length - 1; i++) {
    const loc1 = locations[i];
    const loc2 = locations[i + 1];
    
    totalDistance += haversineDistance(
      loc1.latitude,
      loc1.longitude,
      loc2.latitude,
      loc2.longitude
    );
  }
  
  return totalDistance;
};

/**
 * Fórmula de Haversine para calcular distancia entre dos coordenadas
 * Retorna la distancia en kilómetros
 */
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convertir grados a radianes
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};