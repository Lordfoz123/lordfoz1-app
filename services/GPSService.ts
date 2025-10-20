import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Alert, Platform } from 'react-native';
import { db } from './firebase';

class GPSService {
  private tracking: boolean = false;
  private locationSubscription: Location.LocationSubscription | null = null;
  private userId: string | null = null;

  async isTracking(): Promise<boolean> {
    return this.tracking;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      console.log('📍 Solicitando permisos de ubicación...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Esta app necesita acceso a tu ubicación para funcionar.',
          [{ text: 'OK' }]
        );
        return false;
      }

      console.log('✅ Permisos de ubicación concedidos');
      return true;
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('📍 Ubicación obtenida:', location.coords.latitude, location.coords.longitude);
      return location;
    } catch (error) {
      console.error('❌ Error al obtener ubicación:', error);
      return null;
    }
  }

  async saveLocation(userId: string, location: Location.LocationObject): Promise<void> {
    try {
      await addDoc(collection(db, 'locations'), {
        userId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        platform: Platform.OS,
      });

      console.log('✅ Ubicación guardada en Firestore');
    } catch (error) {
      console.error('❌ Error al guardar ubicación:', error);
    }
  }

  async startTracking(userId: string): Promise<void> {
    try {
      console.log('🚀 Iniciando rastreo GPS...');

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('No hay permisos de ubicación');
      }

      this.userId = userId;
      this.tracking = true;

      const initialLocation = await this.getCurrentLocation();
      if (initialLocation) {
        await this.saveLocation(userId, initialLocation);
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          console.log('📍 Nueva ubicación detectada');
          if (this.userId) {
            await this.saveLocation(this.userId, location);
          }
        }
      );

      console.log('✅ Rastreo GPS iniciado');
    } catch (error) {
      console.error('❌ Error al iniciar rastreo:', error);
      this.tracking = false;
      throw error;
    }
  }

  async stopTracking(): Promise<void> {
    try {
      console.log('🛑 Deteniendo rastreo GPS...');

      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      this.tracking = false;
      this.userId = null;

      console.log('✅ Rastreo GPS detenido');
    } catch (error) {
      console.error('❌ Error al detener rastreo:', error);
    }
  }
}

export default new GPSService();