import { useGPS } from '@/hooks/useGPS';
import { useRealTimeLocation } from '@/hooks/useRealTimeLocation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TrackingBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  workStatus: string;
  isInWorkHours: boolean;
  currentSchedule: any;
}

export default function TrackingBottomSheet({
  isVisible,
  onClose,
  workStatus,
  isInWorkHours,
  currentSchedule,
}: TrackingBottomSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { isTracking, startTracking, stopTracking } = useGPS('cymperu');
  const { currentLocation, lastUpdate } = useRealTimeLocation('cymperu');

  const getStatusColor = () => {
    switch (workStatus) {
      case 'WORKING': return '#10B981';
      case 'BREAK': return '#F59E0B';
      case 'OVERTIME': return '#8B5CF6';
      case 'OFF_DUTY': default: return '#EF4444';
    }
  };

  const getStatusText = () => {
    switch (workStatus) {
      case 'WORKING': return 'En Horario Laboral';
      case 'BREAK': return 'En Descanso';
      case 'OVERTIME': return 'Horas Extra';
      case 'OFF_DUTY': default: return 'Fuera de Horario';
    }
  };

  const handleTrackingToggle = async () => {
    if (isTracking) {
      await stopTracking();
    } else {
      await startTracking();
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `Hace ${diffSeconds}s`;
    if (diffSeconds < 3600) return `Hace ${Math.floor(diffSeconds / 60)}m`;
    return lastUpdate.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={[styles.bottomSheet, isDark && styles.bottomSheetDark]}>
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="navigate" size={24} color={getStatusColor()} />
              <Text style={[styles.headerTitle, isDark && styles.textDark]}>
                Control GPS
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>

          {/* Status Section */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
            
            <Text style={[styles.scheduleText, isDark && styles.textSecondaryDark]}>
              Horario: {currentSchedule?.startTime || '08:00'} - {currentSchedule?.endTime || '18:00'}
            </Text>
          </View>

          {/* Location Info */}
          {currentLocation && (
            <View style={styles.locationSection}>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                Ubicación Actual
              </Text>
              <View style={styles.coordinateRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={[styles.coordinateText, isDark && styles.textSecondaryDark]}>
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <Text style={[styles.lastUpdateText, isDark && styles.textSecondaryDark]}>
                Última actualización: {formatLastUpdate()}
              </Text>
            </View>
          )}

          {/* Controls */}
          <View style={styles.controlsSection}>
            <TouchableOpacity
              style={[
                styles.trackingButton,
                { backgroundColor: isTracking ? '#EF4444' : getStatusColor() }
              ]}
              onPress={handleTrackingToggle}
            >
              <Ionicons 
                name={isTracking ? "stop" : "play"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.trackingButtonText}>
                {isTracking ? 'Detener GPS' : 'Iniciar GPS'}
              </Text>
            </TouchableOpacity>

            {!isInWorkHours && (
              <View style={styles.warningSection}>
                <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Estás fuera del horario laboral
                </Text>
              </View>
            )}
          </View>

          {/* Info Footer */}
          <View style={styles.infoFooter}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              <Text style={[styles.infoText, isDark && styles.textSecondaryDark]}>
                Datos encriptados y seguros
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="eye-outline" size={14} color="#666" />
              <Text style={[styles.infoText, isDark && styles.textSecondaryDark]}>
                Solo administradores autorizados
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  bottomSheetDark: {
    backgroundColor: '#1c1c1e',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: {
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleText: {
    fontSize: 14,
    color: '#666',
  },
  locationSection: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  coordinateText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#999',
  },
  controlsSection: {
    marginBottom: 20,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  trackingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '500',
  },
  infoFooter: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
});