import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGPS } from '../hooks/useGPS';
import { useRealTimeLocation } from '../hooks/useRealTimeLocation';
import MonitoringMap from './MonitoringMap';

export default function MyRealTimeTracking() {
  const { isTracking, startTracking, stopTracking } = useGPS('cymperu');
  const { currentLocation, error } = useRealTimeLocation(isTracking ? 'cymperu' : null); // ← SOLO ESTAS PROPS

  const handleTrackingToggle = async () => {
    if (isTracking) {
      await stopTracking();
      Alert.alert('✅ Tracking Detenido', 'Se ha detenido el rastreo GPS');
    } else {
      const success = await startTracking();
      if (success) {
        Alert.alert('🚀 Tracking Iniciado', 'GPS activado en tiempo real');
      } else {
        Alert.alert('❌ Error', 'No se pudo iniciar el tracking');
      }
    }
  };

  // MOSTRAR ERROR SI HAY
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Error GPS: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleTrackingToggle}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MAPA CON MARCADOR NATIVO */}
      <MonitoringMap 
        currentLocation={currentLocation}
        points={[]} 
        showRoute={false}
        showLegend={false}
        showGPSControls={true}
        shouldCenterOnUser={false}
        selectedMatrix={null}
      />
      
      {/* PANEL DE CONTROL */}
      <View style={styles.controlPanel}>
        <Text style={styles.title}>📍 Mi GPS en Tiempo Real</Text>
        <Text style={[styles.status, { color: isTracking ? '#10B981' : '#EF4444' }]}>
          {isTracking ? '🟢 GPS Activo' : '🔴 GPS Detenido'}
        </Text>
        
        {currentLocation ? (
          <View style={styles.locationInfo}>
            <Text style={styles.coords}>
              📍 Lat: {currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coords}>
              📍 Lng: {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.accuracy}>
              🎯 Ubicación actualizada: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        ) : isTracking ? (
          <View style={styles.searchingContainer}>
            <Text style={styles.searchingText}>🔍 Buscando ubicación GPS...</Text>
          </View>
        ) : (
          <View style={styles.inactiveContainer}>
            <Text style={styles.inactiveText}>📍 GPS desactivado</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isTracking ? '#EF4444' : '#10B981' }]}
          onPress={handleTrackingToggle}
        >
          <Ionicons name={isTracking ? "stop" : "play"} size={24} color="white" />
          <Text style={styles.buttonText}>
            {isTracking ? 'Detener GPS' : 'Iniciar GPS'}
          </Text>
        </TouchableOpacity>

        {/* INFORMACIÓN ADICIONAL */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 El marcador azul muestra tu ubicación actual
          </Text>
          <Text style={styles.infoText}>
            🎯 Usa el botón centrar para volver a tu posición
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  controlPanel: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  status: { 
    fontSize: 16, 
    marginBottom: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  coords: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
    fontWeight: '600',
  },
  accuracy: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  searchingContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  searchingText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600',
  },
  inactiveContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  inactiveText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { 
    color: 'white', 
    fontWeight: '800',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  infoText: {
    fontSize: 12,
    color: '#1565c0',
    marginBottom: 4,
    fontWeight: '500',
  },
});