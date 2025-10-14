import {
  Ionicons,
  MaterialIcons
} from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getAllLocations, saveLocationLocally } from '../../services/storageService';


export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const isSavingRef = useRef(false);

  // Cargar contador al iniciar
useEffect(() => {
  (async () => {
    try {
      console.log('📥 Cargando ubicaciones guardadas...');
      const locations = await getAllLocations();
      setSavedCount(locations.length);
      console.log('✅ Contador cargado:', locations.length);
    } catch (error) {
      console.error('❌ Error cargando contador:', error);
    }
  })();
}, []);

  // Solicitar permisos
  const requestLocationPermission = async () => {
    try {
      console.log('📍 Solicitando permisos de ubicación...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Estado de permisos:', status);
      
      if (status !== 'granted') {
        setErrorMsg('Permiso denegado');
        Alert.alert('Error', 'Necesitamos permiso para acceder a tu ubicación');
        return false;
      }
      
      console.log('✅ Permisos concedidos');
      return true;
    } catch (error: any) {
      console.error('❌ Error solicitando permisos:', error);
      setErrorMsg('Error al solicitar permisos');
      return false;
    }
  };

  // Guardar ubicación (con protección contra duplicados)
  const saveLocation = async (loc: Location.LocationObject) => {
    console.log('\n💾 === saveLocation INICIANDO ===');
    
    // Prevenir guardados simultáneos
    if (isSavingRef.current) {
      console.log('⏭️ Ya hay guardado en proceso, saltando...');
      return;
    }

    try {
      isSavingRef.current = true;
      console.log('🔒 Flag de guardado: ACTIVADO');
      
      console.log('🔥 Llamando a saveLocationToFirebase...');
      console.log('📦 Datos:', {
        userId: 'lordfoz123',
        lat: loc.coords.latitude,
        lng: loc.coords.longitude
      });
      
const docId = await saveLocationLocally(loc, 'lordfoz123');

      console.log('✅ Firebase respondió con ID:', docId);
      
      setSavedCount(prev => {
        const newCount = prev + 1;
        console.log('📊 Contador actualizado:', prev, '→', newCount);
        return newCount;
      });
      
      console.log('✅ saveLocation: COMPLETADO');
      return docId;
      
    } catch (error: any) {
      console.error('\n❌ === ERROR EN saveLocation ===');
      console.error('❌ Error completo:', error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      console.error('❌ === FIN ERROR ===\n');
      throw error;
      
    } finally {
      isSavingRef.current = false;
      console.log('🔓 Flag de guardado: LIBERADO');
      console.log('💾 === saveLocation FINALIZADO ===\n');
    }
  };

  // Obtener ubicación actual (una sola vez)
  const getCurrentLocation = async () => {
    console.log('\n🎯 === getCurrentLocation INICIANDO ===');
    setLoading(true);
    setErrorMsg(null);

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT: 15 segundos cumplidos, forzando fin de loading');
      setLoading(false);
      Alert.alert('Timeout', 'La operación tardó demasiado. Intenta de nuevo.');
    }, 15000);

    try {
      console.log('📍 Paso 1: Solicitando permisos...');
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        console.log('❌ Permisos denegados, abortando...');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      console.log('📍 Paso 2: Obteniendo ubicación GPS...');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('✅ Ubicación GPS obtenida:', {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy
      });
      
      setLocation(loc);
      
      console.log('📍 Paso 3: Guardando en Firebase...');
      
      try {
        await saveLocation(loc);
        console.log('✅ Guardado exitoso');
        clearTimeout(timeoutId);
        setLoading(false);
        Alert.alert('✅ Éxito', 'Ubicación guardada en Firebase');
        
      } catch (saveError: any) {
        console.error('❌ Error al guardar:', saveError);
        clearTimeout(timeoutId);
        setLoading(false);
        Alert.alert('⚠️ Ubicación obtenida', 'Pero no se pudo guardar en Firebase');
      }
      
    } catch (error: any) {
      console.error('\n❌ === ERROR GENERAL ===');
      console.error('❌ Error:', error);
      console.error('❌ Message:', error?.message);
      console.error('❌ === FIN ERROR ===\n');
      
      clearTimeout(timeoutId);
      setLoading(false);
      setErrorMsg('Error al obtener ubicación');
      Alert.alert('Error', `No se pudo obtener la ubicación: ${error.message}`);
    }
    
    console.log('🎯 === getCurrentLocation FINALIZADO ===\n');
  };

  // Iniciar seguimiento continuo
  const startTracking = async () => {
    console.log('\n🔄 === INICIANDO SEGUIMIENTO CONTINUO ===');
    
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('❌ No hay permisos, abortando seguimiento');
      return;
    }

    setTracking(true);
    Alert.alert('🟢 Seguimiento iniciado', 'Se guardará cada 30 segundos o 50 metros');

    try {
      console.log('⏰ Configurando watchPositionAsync...');
      console.log('⏰ Intervalo: 30 segundos');
      console.log('📏 Distancia: 50 metros');
      
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // 30 segundos
          distanceInterval: 50, // 50 metros
        },
        async (loc) => {
          console.log('\n📍 === NUEVA UBICACIÓN RECIBIDA (watchPosition) ===');
          console.log('📍 Lat:', loc.coords.latitude);
          console.log('📍 Lng:', loc.coords.longitude);
          console.log('📍 Timestamp:', new Date(loc.timestamp).toLocaleTimeString());
          
          setLocation(loc);
          
          try {
            await saveLocation(loc);
            console.log('✅ Ubicación auto-guardada');
          } catch (error) {
            console.error('❌ Error en auto-guardado:', error);
          }
          
          console.log('📍 === FIN NUEVA UBICACIÓN ===\n');
        }
      );

      subscriptionRef.current = subscription;
      console.log('✅ Seguimiento configurado exitosamente');
      console.log('🔄 === SEGUIMIENTO ACTIVO ===\n');
      
    } catch (error: any) {
      console.error('❌ Error iniciando seguimiento:', error);
      setTracking(false);
      Alert.alert('Error', 'No se pudo iniciar el seguimiento');
    }
  };

  // Detener seguimiento
  const stopTracking = () => {
    console.log('\n🛑 === DETENIENDO SEGUIMIENTO ===');
    
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
      console.log('✅ Suscripción removida');
    }
    
    setTracking(false);
    isSavingRef.current = false;
    
    console.log('📊 Total guardadas:', savedCount);
    Alert.alert('🔴 Seguimiento detenido', `Se guardaron ${savedCount} ubicaciones`);
    console.log('🛑 === SEGUIMIENTO DETENIDO ===\n');
  };

  // Cargar datos al montar y limpiar al desmontar
useEffect(() => {
  console.log('🎬 Componente montado');
  
  // Cargar contador de ubicaciones guardadas
  const loadSavedCount = async () => {
    try {
      console.log('📥 Cargando ubicaciones guardadas...');
      const locations = await getAllLocations();
      console.log('📊 Ubicaciones encontradas:', locations.length);
      setSavedCount(locations.length);
      console.log('✅ Contador inicializado en:', locations.length);
    } catch (error) {
      console.error('❌ Error cargando contador:', error);
    }
  };
  
  loadSavedCount();
  
  return () => {
    console.log('🎬 Componente desmontado, limpiando...');
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }
  };
}, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="location" size={64} color="white" />
            <Text style={styles.title}>GPS Tracking App</Text>
            <Text style={styles.subtitle}>Lordfoz123</Text>
          </View>

          {/* Card de Estado */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons 
                name={tracking ? "gps-fixed" : "gps-not-fixed"} 
                size={24} 
                color={tracking ? "#25d366" : "#999"} 
              />
              <Text style={styles.cardTitle}>
                Estado: {tracking ? 'Rastreando' : 'Detenido'}
              </Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="cloud-upload" size={24} color="#4a90e2" />
                <Text style={styles.statNumber}>{savedCount}</Text>
                <Text style={styles.statLabel}>Guardadas</Text>
              </View>
              
              <View style={styles.statBox}>
                <Ionicons name="wifi" size={24} color="#25d366" />
                <Text style={styles.statNumber}>Firebase</Text>
                <Text style={styles.statLabel}>Conectado</Text>
              </View>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
              </View>
            )}

            {errorMsg && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#f44336" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}
          </View>

          {/* Card de Ubicación */}
          {location && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="map" size={24} color="#4a90e2" />
                <Text style={styles.cardTitle}>Última Ubicación</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Latitud:</Text>
                <Text style={styles.dataValue}>
                  {location.coords.latitude.toFixed(6)}°
                </Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Longitud:</Text>
                <Text style={styles.dataValue}>
                  {location.coords.longitude.toFixed(6)}°
                </Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Altitud:</Text>
                <Text style={styles.dataValue}>
                  {location.coords.altitude?.toFixed(2) || 'N/A'} m
                </Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Precisión:</Text>
                <Text style={styles.dataValue}>
                  ±{location.coords.accuracy?.toFixed(2)} m
                </Text>
              </View>

              {location.coords.speed !== null && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Velocidad:</Text>
                  <Text style={styles.dataValue}>
                    {((location.coords.speed || 0) * 3.6).toFixed(2)} km/h
                  </Text>
                </View>
              )}

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Hora:</Text>
                <Text style={styles.dataValue}>
                  {new Date(location.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          )}

          {/* Botones de Control */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="control-camera" size={24} color="#9c27b0" />
              <Text style={styles.cardTitle}>Controles</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary, (loading || tracking) && styles.buttonDisabled]} 
              onPress={getCurrentLocation}
              disabled={loading || tracking}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.buttonText}>Obtener Ubicación Única</Text>
            </TouchableOpacity>

            {!tracking ? (
              <TouchableOpacity 
                style={[styles.button, styles.buttonSuccess, loading && styles.buttonDisabled]} 
                onPress={startTracking}
                disabled={loading}
              >
                <MaterialIcons name="play-arrow" size={20} color="white" />
                <Text style={styles.buttonText}>Iniciar Auto-Guardado</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.buttonDanger]} 
                onPress={stopTracking}
              >
                <MaterialIcons name="stop" size={20} color="white" />
                <Text style={styles.buttonText}>Detener Seguimiento</Text>
              </TouchableOpacity>
            )}

              {/* BOTÓN TEMPORAL: LEER FIREBASE */}
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: '#e91e63', marginTop: 20 }]} 
    onPress={async () => {
      try {
        console.log('\n📥 === LEYENDO DE FIREBASE ===');
        const { getLocationsFromFirebase } = require('../../services/locationService');
        const locations = await getLocationsFromFirebase('lordfoz123', 20);
        
        console.log('📊 Ubicaciones en Firebase:', locations.length);
        
        if (locations.length > 0) {
          console.log('📊 Primera ubicación:', JSON.stringify(locations[0], null, 2));
          console.log('📊 Última ubicación:', JSON.stringify(locations[locations.length - 1], null, 2));
        }
        
        Alert.alert(
          '✅ Firebase', 
          `${locations.length} ubicaciones encontradas en Firebase\n\n` +
          `Revisa la terminal de tu Mac para ver los detalles completos.`
        );
        
      } catch (error: any) {
        console.error('❌ Error leyendo Firebase:', error);
        Alert.alert('❌ Error', `No se pudo leer de Firebase:\n${error.message}`);
      }
    }}
  >
    <Ionicons name="cloud-download" size={20} color="white" />
    <Text style={styles.buttonText}>📥 LEER FIREBASE</Text>
  </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#00bcd4" />
              <Text style={styles.cardTitle}>Información</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#25d366" />
              <Text style={styles.infoText}>
                Auto-guardado: cada 30 segundos o 50 metros
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#25d366" />
              <Text style={styles.infoText}>
                Todas las ubicaciones se guardan en Firebase
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#25d366" />
              <Text style={styles.infoText}>
                Los datos están disponibles desde cualquier dispositivo
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a90e2',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    marginLeft: 8,
    color: '#f44336',
    fontSize: 14,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: '#4a90e2',
  },
  buttonSuccess: {
    backgroundColor: '#25d366',
  },
  buttonDanger: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
});