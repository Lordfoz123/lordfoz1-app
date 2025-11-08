import * as Location from 'expo-location';
import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, setDoc, Timestamp, where } from 'firebase/firestore';
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

// ===== TUS FUNCIONES EXISTENTES (mantener todas) =====
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

export const getLastLocation = async (userId: string) => {
  try {
    const locations = await getUserLocations(userId, 1);
    return locations[0] || null;
  } catch (error) {
    console.error('❌ Error obteniendo última ubicación:', error);
    throw error;
  }
};

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

export const getTodayLocations = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getUserLocationsByDateRange(userId, today, tomorrow);
};

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

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
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

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// ===== NUEVAS FUNCIONES PARA TRACKING EN TIEMPO REAL =====

class RealTimeLocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking = false;

  /**
   * Iniciar tracking en tiempo real
   * Captura GPS cada 5 segundos y guarda en Firebase
   */
  async startTracking(userId: string = 'cymperu', userName: string = 'cymperu'): Promise<boolean> {
    try {
      // Pedir permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permisos de ubicación denegados');
        return false;
      }

      this.isTracking = true;

      // Tracking cada 5 segundos
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 5 segundos
          distanceInterval: 5, // 5 metros
        },
        async (location) => {
          // Guardar usando tu función existente
          const locationData: LocationData = {
            userId,
            userName,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: new Date(),
            speed: location.coords.speed || undefined,
            heading: location.coords.heading || undefined,
          };

          await saveLocation(locationData);
          
          // También guardar como "ubicación actual" para tiempo real
          await this.updateCurrentLocation(userId, locationData);
        }
      );

      console.log('✅ Tracking en tiempo real iniciado para:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error iniciando tracking:', error);
      return false;
    }
  }

  /**
   * Detener tracking en tiempo real
   */
  async stopTracking(): Promise<void> {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
      this.isTracking = false;
      console.log('✅ Tracking detenido');
    }
  }

  /**
   * Guardar ubicación actual (para mostrar en tiempo real)
   */
  private async updateCurrentLocation(userId: string, locationData: LocationData): Promise<void> {
    try {
      const currentLocationRef = doc(db, 'currentLocations', userId);
      
      await setDoc(currentLocationRef, {
        ...locationData,
        timestamp: Timestamp.fromDate(locationData.timestamp),
        isOnline: true,
        lastSeen: Timestamp.now(),
      });

      console.log('📍 Ubicación actual actualizada:', locationData.latitude, locationData.longitude);
    } catch (error) {
      console.error('❌ Error actualizando ubicación actual:', error);
    }
  }

  /**
   * Suscribirse a cambios de ubicación actual en tiempo real
   */
  subscribeToCurrentLocation(userId: string, callback: (locationData: LocationData | null) => void) {
    const currentLocationRef = doc(db, 'currentLocations', userId);
    
    return onSnapshot(currentLocationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const locationData: LocationData = {
          userId: data.userId,
          userName: data.userName,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          timestamp: data.timestamp?.toDate() || new Date(),
          speed: data.speed,
          heading: data.heading,
        };
        callback(locationData);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Obtener ubicación actual una vez
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      return null;
    }
  }

  getIsTracking(): boolean {
    return this.isTracking;
  }
}

// Exportar instancia singleton
export const realTimeLocationService = new RealTimeLocationService();