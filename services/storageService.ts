import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLocationToFirebase } from './locationService';

// Variable de control para evitar guardados simultáneos
let isSaving = false;

// Guardar ubicación: LOCAL + FIREBASE (híbrido)
export const saveLocationLocally = async (location: any, userId: string): Promise<string> => {
  // Evitar guardados simultáneos
  if (isSaving) {
    console.log('⚠️ Ya hay un guardado en proceso, esperando...');
    return '';
  }

  isSaving = true;

  try {
    console.log('\n💾 === saveLocation INICIANDO ===');
    console.log('🔓 Flag de guardado: ACTIVADO');
    
    // Crear objeto de ubicación
    const locationData = {
      id: Date.now().toString(),
      userId: userId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude || null,
      accuracy: location.coords.accuracy || null,
      speed: location.coords.speed || null,
      heading: location.coords.heading || null,
      timestamp: location.timestamp,
      createdAt: Date.now(),
      synced: false,
      firebaseId: null as string | null
    };

    console.log('🔸 Datos a guardar:', {
      id: locationData.id,
      lat: locationData.latitude,
      lng: locationData.longitude,
      userId: locationData.userId
    });

    // 1. GUARDAR LOCAL (siempre - es backup)
    console.log('🔸 Guardando ubicación localmente...');
    const existingData = await AsyncStorage.getItem('locations');
    const locations: any[] = existingData ? JSON.parse(existingData) : [];
    
    console.log('💾 Ubicaciones existentes:', locations.length);
    
    locations.push(locationData);
    await AsyncStorage.setItem('locations', JSON.stringify(locations));
    
    console.log('✅ Ubicación guardada localmente, ID:', locationData.id);
    console.log('🔸 Total ubicaciones guardadas:', locations.length);
    
    // 2. INTENTAR GUARDAR EN FIREBASE
    console.log('\n🔥 === PASO 2: INTENTANDO FIREBASE ===');
    console.log('🔥 Llamando a saveLocationToFirebase...');
    console.log('🔥 Tipo de función:', typeof saveLocationToFirebase);
    
    let firebaseId: string | null = null;
    let syncSuccess = false;
    
    try {
      console.log('🔥 Ejecutando saveLocationToFirebase...');
      
      firebaseId = await saveLocationToFirebase(location, userId);
      
      console.log('🔥 saveLocationToFirebase retornó:', firebaseId);
      
      if (firebaseId) {
        // Marcar como sincronizado
        locationData.synced = true;
        locationData.firebaseId = firebaseId;
        syncSuccess = true;
        
        // Actualizar en AsyncStorage
        const index = locations.length - 1;
        locations[index] = locationData;
        await AsyncStorage.setItem('locations', JSON.stringify(locations));
        
        console.log('✅ Firebase respondió con ID:', firebaseId);
        console.log('✅ FIREBASE: Sincronizado');
      } else {
        console.log('⚠️ Firebase no retornó ID');
      }
      
    } catch (firebaseError: any) {
      console.log('\n❌ === ERROR EN FIREBASE ===');
      console.log('❌ Error capturado:', firebaseError);
      console.log('❌ Mensaje:', firebaseError.message);
      console.log('❌ Código:', firebaseError.code);
      console.log('❌ === FIN ERROR FIREBASE ===\n');
      console.log('⚠️ FIREBASE: No se pudo sincronizar');
      console.log('💾 Los datos quedan guardados LOCAL');
    }
    
    console.log('✅ saveLocation: COMPLETADO');
    console.log('🔓 Flag de guardado: LIBERADO');
    console.log('💾 === saveLocation FINALIZADO ===');
    console.log('📊 Resultado:', syncSuccess ? 'LOCAL + FIREBASE ✅' : 'SOLO LOCAL ⚠️');
    console.log('');
    
    isSaving = false;
    return firebaseId || locationData.id;
    
  } catch (error: any) {
    isSaving = false;
    console.error('\n❌ === ERROR CRÍTICO EN GUARDADO ===');
    console.error('❌', error);
    console.error('❌ === FIN ERROR ===\n');
    throw error;
  }
};

// Obtener todas las ubicaciones locales
export const getAllLocations = async (): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem('locations');
    const locations = data ? JSON.parse(data) : [];
    return locations;
  } catch (error) {
    console.error('❌ Error obteniendo ubicaciones:', error);
    return [];
  }
};

// Limpiar todas las ubicaciones locales
export const clearAllLocations = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem('locations');
    console.log('🗑️ Todas las ubicaciones locales eliminadas');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando ubicaciones:', error);
    return false;
  }
};

// Obtener estadísticas
export const getLocationStats = async () => {
  try {
    const locations = await getAllLocations();
    const synced = locations.filter((loc: any) => loc.synced).length;
    const pending = locations.length - synced;
    
    return {
      total: locations.length,
      synced: synced,
      pending: pending,
      firstLocation: locations[0] || null,
      lastLocation: locations[locations.length - 1] || null
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return {
      total: 0,
      synced: 0,
      pending: 0,
      firstLocation: null,
      lastLocation: null
    };
  }
};

// Sincronizar ubicaciones pendientes con Firebase
export const syncPendingLocations = async (): Promise<number> => {
  try {
    console.log('\n🔄 === SINCRONIZANDO UBICACIONES PENDIENTES ===');
    
    const locations = await getAllLocations();
    const pending = locations.filter((loc: any) => !loc.synced);
    
    console.log('📤 Ubicaciones pendientes:', pending.length);
    
    if (pending.length === 0) {
      console.log('✅ No hay ubicaciones pendientes');
      return 0;
    }
    
    let synced = 0;
    
    for (let i = 0; i < pending.length; i++) {
      const loc = pending[i];
      console.log(`📤 Sincronizando ${i + 1}/${pending.length}...`);
      
      try {
        // Recrear objeto Location
        const fakeLocation = {
          coords: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            altitude: loc.altitude,
            accuracy: loc.accuracy,
            speed: loc.speed,
            heading: loc.heading
          },
          timestamp: loc.timestamp
        };
        
        const firebaseId = await saveLocationToFirebase(fakeLocation, loc.userId);
        
        // Marcar como sincronizado
        loc.synced = true;
        loc.firebaseId = firebaseId;
        synced++;
        
        console.log(`✅ ${i + 1}/${pending.length} sincronizado`);
        
      } catch (error: any) {
        console.error(`❌ Error sincronizando ${i + 1}:`, error.message);
      }
    }
    
    // Actualizar AsyncStorage con ubicaciones sincronizadas
    await AsyncStorage.setItem('locations', JSON.stringify(locations));
    
    console.log(`✅ Sincronización completa: ${synced}/${pending.length}`);
    console.log('🔄 === FIN SINCRONIZACIÓN ===\n');
    
    return synced;
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return 0;
  }
};