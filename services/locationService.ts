import {
    addDoc,
    collection,
    limit as fsLimit,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from './firebase';

// Guardar ubicación en Firebase
export const saveLocationToFirebase = async (location: any, userId: string): Promise<string> => {
  try {
    console.log('\n🔥 === INTENTANDO GUARDAR EN FIREBASE ===');
    console.log('🔥 Firebase db objeto:', typeof db);
    console.log('🔥 Colección destino:', 'locations');
    console.log('🔥 Usuario:', userId);
    console.log('🔥 Coordenadas:', {
      lat: location.coords.latitude,
      lng: location.coords.longitude
    });
    console.log('🔥 Datos completos a guardar:', {
      userId: userId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude || null,
      accuracy: location.coords.accuracy || null,
      speed: location.coords.speed || null,
      heading: location.coords.heading || null,
      timestamp: location.timestamp,
      createdAt: 'serverTimestamp()',
      platform: Platform.OS
    });
    
    console.log('🔥 Llamando a addDoc() de Firestore...');
    
    const docRef = await addDoc(collection(db, 'locations'), {
      userId: userId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude || null,
      accuracy: location.coords.accuracy || null,
      speed: location.coords.speed || null,
      heading: location.coords.heading || null,
      timestamp: location.timestamp,
      createdAt: serverTimestamp(),
      platform: Platform.OS
    });
    
    console.log('✅ addDoc() completado exitosamente');
    console.log('✅ Documento creado con ID:', docRef.id);
    console.log('✅ Path completo:', docRef.path);
    console.log('✅ Colección:', docRef.parent.id);
    console.log('🔥 === GUARDADO EN FIREBASE EXITOSO ===\n');
    
    return docRef.id;
    
  } catch (error: any) {
    console.error('\n❌ === ERROR CRÍTICO EN FIREBASE ===');
    console.error('❌ Tipo de error:', typeof error);
    console.error('❌ Error completo:', error);
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Código:', error.code);
    console.error('❌ Name:', error.name);
    
    if (error.stack) {
      console.error('❌ Stack trace:', error.stack);
    }
    
    if (error.code) {
      console.error('❌ Firebase error code:', error.code);
      
      // Errores comunes
      if (error.code === 'permission-denied') {
        console.error('❌ PERMISOS DENEGADOS: Revisa las reglas de Firestore');
      } else if (error.code === 'unavailable') {
        console.error('❌ FIREBASE NO DISPONIBLE: Revisa conexión a internet');
      } else if (error.code === 'unauthenticated') {
        console.error('❌ NO AUTENTICADO: Se requiere autenticación');
      }
    }
    
    console.error('❌ === FIN ERROR FIREBASE ===\n');
    throw error;
  }
};

// Obtener ubicaciones desde Firebase
export const getLocationsFromFirebase = async (userId: string, limit: number = 50): Promise<any[]> => {
  try {
    console.log('\n📥 === LEYENDO DE FIREBASE ===');
    console.log('📥 Usuario:', userId);
    console.log('📥 Límite:', limit);
    console.log('📥 Construyendo query...');
    
    const q = query(
      collection(db, 'locations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      fsLimit(limit)
    );
    
    console.log('📥 Ejecutando getDocs()...');
    const querySnapshot = await getDocs(q);
    
    console.log('📥 Documentos recibidos:', querySnapshot.size);
    
    const locations = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Documento ID:', doc.id);
      console.log('📄 Datos:', data);
      return {
        id: doc.id,
        ...data
      };
    });
    
    console.log('✅ Total ubicaciones procesadas:', locations.length);
    
    if (locations.length > 0) {
      console.log('📊 Primera ubicación:', JSON.stringify(locations[0], null, 2));
      console.log('📊 Última ubicación:', JSON.stringify(locations[locations.length - 1], null, 2));
    } else {
      console.log('⚠️ No se encontraron ubicaciones para el usuario:', userId);
    }
    
    console.log('📥 === FIN LECTURA FIREBASE ===\n');
    
    return locations;
    
  } catch (error: any) {
    console.error('\n❌ === ERROR LEYENDO FIREBASE ===');
    console.error('❌ Error completo:', error);
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Código:', error.code);
    
    if (error.code === 'failed-precondition') {
      console.error('❌ ÍNDICE REQUERIDO: La consulta necesita un índice');
      console.error('❌ Revisa la pestaña Índices en Firebase Console');
    }
    
    console.error('❌ === FIN ERROR LECTURA ===\n');
    return [];
  }
};

// Obtener última ubicación
export const getLastLocationFromFirebase = async (userId: string): Promise<any | null> => {
  try {
    console.log('📍 Obteniendo última ubicación de Firebase...');
    const locations = await getLocationsFromFirebase(userId, 1);
    
    if (locations.length > 0) {
      console.log('✅ Última ubicación encontrada:', locations[0]);
      return locations[0];
    } else {
      console.log('⚠️ No hay ubicaciones para el usuario:', userId);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo última ubicación:', error);
    return null;
  }
};

// FUNCIÓN TEMPORAL: Leer TODO sin filtros (para debug)
export const getAllLocationsFromFirebase = async (limit: number = 50): Promise<any[]> => {
  try {
    console.log('\n📥 === LEYENDO TODO DE FIREBASE (SIN FILTROS) ===');
    console.log('📥 Límite:', limit);
    
    const q = query(
      collection(db, 'locations'),
      fsLimit(limit)
    );
    
    console.log('📥 Ejecutando getDocs() sin filtros...');
    const querySnapshot = await getDocs(q);
    
    console.log('📥 Total documentos en colección:', querySnapshot.size);
    
    const locations = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });
    
    console.log('✅ Ubicaciones encontradas:', locations.length);
    
    if (locations.length > 0) {
      console.log('📊 TODAS LAS UBICACIONES:');
      locations.forEach((loc: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${loc.id}, userId: ${loc.userId || 'N/A'}, lat: ${loc.latitude || 'N/A'}, lng: ${loc.longitude || 'N/A'}`);
      });
    } else {
      console.log('⚠️ La colección "locations" está vacía');
    }
    
    console.log('📥 === FIN LECTURA SIN FILTROS ===\n');
    
    return locations;
    
  } catch (error: any) {
    console.error('\n❌ === ERROR LEYENDO SIN FILTROS ===');
    console.error('❌ Error:', error);
    console.error('❌ Mensaje:', error.message);
    console.error('❌ === FIN ERROR ===\n');
    return [];
  }
};