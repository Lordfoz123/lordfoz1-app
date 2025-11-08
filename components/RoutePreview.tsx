import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { Polyline } from 'react-native-maps';

interface RoutePreviewProps {
  currentLocation: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  destinationName: string;
  onClose?: () => void;
  onShowDetails?: () => void; // ✅ NUEVA PROP PARA VER DETALLES
  style?: any;
}

export const RoutePreview: React.FC<RoutePreviewProps> = ({
  currentLocation,
  destination,
  destinationName,
  onClose,
  onShowDetails, // ✅ NUEVA PROP
  style
}) => {
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // ✅ CALCULAR DISTANCIA EN KM
  const calculateDistance = (start: any, end: any) => {
    const R = 6371;
    const dLat = (end.latitude - start.latitude) * Math.PI / 180;
    const dLon = (end.longitude - start.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  // ✅ FORMATO DE TIEMPO EN HORAS:MINUTOS
  const estimateTime = (distanceKm: string) => {
    const distance = parseFloat(distanceKm);
    const timeHours = distance / 30;
    const totalMinutes = Math.round(timeHours * 60);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  };

  // ✅ ABRIR GOOGLE MAPS
  const openGoogleMaps = () => {
    const lat = destination.latitude;
    const lng = destination.longitude;
    
    if (Platform.OS === 'ios') {
      const url = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
          Linking.openURL(webUrl);
        }
      });
    } else {
      const url = `google.navigation:q=${lat},${lng}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  const distance = calculateDistance(currentLocation, destination);
  const estimatedTime = estimateTime(distance);

  return (
    <>
      {/* ✅ LÍNEA DIRECTA EN EL MAPA */}
      <Polyline
        coordinates={[currentLocation, destination]}
        strokeColor="#4CAF50"
        strokeWidth={3}
        strokePattern={[10, 5]}
        lineDashPhase={0}
      />

      {/* ✅ PANEL CON BOTONES INTEGRADOS */}
      <View style={[
        styles.routePanel, 
        isDark && styles.routePanelDark,
        style
      ]}>
        <View style={styles.routeHeader}>
          <View style={styles.routeInfo}>
            <Text style={[
              styles.destinationName, 
              isDark && styles.destinationNameDark
            ]} numberOfLines={1}>
              📍 {destinationName}
            </Text>
            <View style={styles.routeStats}>
              <Text style={[
                styles.statText, 
                isDark && styles.statTextDark
              ]}>
                🛣️ {distance} km • ⏱️ {estimatedTime}
              </Text>
            </View>
          </View>
          
          {/* ✅ BOTONES DE ACCIÓN EN EL HEADER */}
          <View style={styles.headerActions}>
            {onShowDetails && (
              <TouchableOpacity 
                onPress={onShowDetails} 
                style={[
                  styles.actionButton,
                  isDark && styles.actionButtonDark
                ]}
              >
                <Ionicons 
                  name="information-circle-outline" 
                  size={20} 
                  color="#4CAF50" 
                />
              </TouchableOpacity>
            )}
            
            {onClose && (
              <TouchableOpacity 
                onPress={onClose} 
                style={[
                  styles.actionButton,
                  isDark && styles.actionButtonDark
                ]}
              >
                <Ionicons 
                  name="close" 
                  size={18} 
                  color={isDark ? '#fff' : '#666'} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ✅ BOTÓN DE NAVEGACIÓN */}
        <TouchableOpacity 
          style={[
            styles.navigationButton,
            isDark && styles.navigationButtonDark
          ]}
          onPress={openGoogleMaps}
          activeOpacity={0.7}
        >
          <View style={styles.navIcon}>
            <Ionicons 
              name="navigate" 
              size={20} 
              color="#4CAF50"
            />
          </View>
          <View style={styles.navContent}>
            <Text style={[
              styles.navTitle,
              isDark && styles.navTitleDark
            ]}>
              Abrir en Google Maps
            </Text>
            <Text style={[
              styles.navSubtitle,
              isDark && styles.navSubtitleDark
            ]}>
              Navegación turn-by-turn
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={isDark ? '#666' : '#999'} 
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  routePanel: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    zIndex: 25, // ✅ AGREGAR ESTA LÍNEA
  },
  routePanelDark: {
    backgroundColor: '#2c2c2e',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  routeInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  destinationNameDark: {
    color: '#fff',
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statTextDark: {
    color: '#999',
  },
  
  // ✅ BOTONES DE ACCIÓN EN EL HEADER
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  // ✅ BOTÓN DE NAVEGACIÓN
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  navigationButtonDark: {
    backgroundColor: '#3c3c3e',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  navContent: {
    flex: 1,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  navTitleDark: {
    color: '#fff',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  navSubtitleDark: {
    color: '#999',
  },
});