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
      // ✅ CREAR OBJETO CON VALORES SEGUROS
      const locationData: any = {
        userId: userId || 'unknown',
        latitude: location.coords.latitude || 0,
        longitude: location.coords.longitude || 0,
        accuracy: location.coords.accuracy || 0,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        platform: Platform.OS,
      };

      // ✅ AGREGAR CAMPOS OPCIONALES SOLO SI TIENEN VALOR
      if (location.coords.altitude !== null && location.coords.altitude !== undefined) {
        locationData.altitude = location.coords.altitude;
      }

      if (location.coords.speed !== null && location.coords.speed !== undefined) {
        locationData.speed = location.coords.speed;
      }

      if (location.coords.heading !== null && location.coords.heading !== undefined) {
        locationData.heading = location.coords.heading;
      }

      // ✅ FILTRAR CAMPOS UNDEFINED/NULL
      const cleanData = Object.fromEntries(
        Object.entries(locationData).filter(([_, value]) => value !== undefined && value !== null)
      );

      await addDoc(collection(db, 'locations'), cleanData);

      console.log('✅ Ubicación guardada en Firestore');
    } catch (error) {
      console.error('❌ Error al guardar ubicación:', error);
      // ✅ NO LANZAR ERROR PARA NO INTERRUMPIR EL TRACKING
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

      // ✅ GUARDAR UBICACIÓN INICIAL DE FORMA SEGURA
      const initialLocation = await this.getCurrentLocation();
      if (initialLocation && this.userId) {
        await this.saveLocation(this.userId, initialLocation);
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          console.log('📍 Nueva ubicación detectada');
          // ✅ VALIDAR QUE TENEMOS USUARIO ANTES DE GUARDAR
          if (this.userId && location && location.coords) {
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