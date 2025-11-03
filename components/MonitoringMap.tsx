import { getAllMatrices, getMatrixConfig } from '@/constants/monitoring';
import { MonitoringPoint } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

const lightMapStyle = [
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels.text", stylers: [{ visibility: "off" }] }
];

interface MonitoringMapProps {
  points: MonitoringPoint[];
  currentLocation?: { latitude: number; longitude: number };
  showRoute?: boolean;
  showLegend?: boolean;
  onPointPress?: (point: MonitoringPoint) => void;
  initialRegion?: Region;
}

export default function MonitoringMap({ 
  points, 
  currentLocation,
  showRoute = true,
  showLegend = true,
  onPointPress,
  initialRegion
}: MonitoringMapProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapRef = useRef<MapView>(null);
  const [isLegendVisible, setIsLegendVisible] = useState(false);

  const getCalculatedRegion = (): Region => {
    if (initialRegion) return initialRegion;
    if (points.length === 0) {
      return { latitude: -12.0464, longitude: -77.0428, latitudeDelta: 0.1, longitudeDelta: 0.1 };
    }

    const lats = points.map(p => p.location.latitude);
    const lngs = points.map(p => p.location.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5;
    const deltaLng = (maxLng - minLng) * 1.5;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.05),
      longitudeDelta: Math.max(deltaLng, 0.05),
    };
  };

  useEffect(() => {
    if (points.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(points.map(p => p.location), {
          edgePadding: { top: 150, right: 50, bottom: 200, left: 50 },
          animated: true,
        });
      }, 100);
    }
  }, [points]);

  const renderMarker = (point: MonitoringPoint, index: number) => {
    const config = getMatrixConfig(point.matrix);
    const isCompleted = point.status === 'completed';

    return (
      <Marker
        key={`marker-${point.id}-${index}`}
        coordinate={point.location}
        onPress={() => onPointPress?.(point)}
        tracksViewChanges={false}
      >
        <View style={styles.markerContainer}>
          <View style={[styles.markerCircle, { backgroundColor: config.color, opacity: isCompleted ? 0.85 : 1 }]}>
            <Ionicons name={config.icon} size={16} color="#fff" />
          </View>
          <View style={[styles.numberBadge, { backgroundColor: config.color }]}>
            <Text style={styles.numberText}>{point.sequence}</Text>
          </View>
          {isCompleted && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={10} color="#fff" />
            </View>
          )}
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getCalculatedRegion()}
        customMapStyle={isDark ? darkMapStyle : lightMapStyle}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={false}
        showsBuildings={true}
        scrollEnabled={true}
        zoomEnabled={true}
        toolbarEnabled={false}
      >
        {currentLocation && (
          <Marker coordinate={currentLocation} tracksViewChanges={false}>
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationPulse} />
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}

        {points.map((point, index) => renderMarker(point, index))}

        {showRoute && points.length > 1 && (
          <Polyline
            coordinates={points.map(p => p.location)}
            strokeColor={isDark ? '#42A5F5' : '#2196F3'}
            strokeWidth={3}
            lineDashPattern={[1, 10]}
            lineCap="round"
          />
        )}
      </MapView>

      {/* BOTÓN TOGGLE LEYENDA - MÁS ARRIBA */}
      {showLegend && (
        <View style={styles.legendButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.legendButton, 
              isDark && styles.legendButtonDark,
              isLegendVisible && styles.legendButtonActive
            ]}
            onPress={() => setIsLegendVisible(!isLegendVisible)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isLegendVisible ? "layers" : "layers-outline"}
              size={22} 
              color={isLegendVisible ? '#4CAF50' : (isDark ? '#fff' : '#333')} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* LEYENDA */}
      {showLegend && isLegendVisible && (
        <View style={[styles.legend, isDark && styles.legendDark]}>
          <View style={styles.legendHeader}>
            <Ionicons name="layers" size={16} color={isDark ? '#fff' : '#333'} />
            <Text style={[styles.legendTitle, isDark && styles.textDark]}>Matrices</Text>
          </View>
          {getAllMatrices().map((config, idx) => (
            <View key={`legend-${idx}`} style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: config.color }]}>
                <Ionicons name={config.icon} size={14} color="#fff" />
              </View>
              <Text style={[styles.legendText, isDark && styles.textDark]}>{config.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  numberBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  numberText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.25)',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#fff',
  },
  legendButtonContainer: {
    position: 'absolute',
    left: 16,
    bottom: Platform.OS === 'ios' ? 120 : 130,
    zIndex: 100,
  },
  legendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  legendButtonDark: {
    backgroundColor: '#2c2c2e',
  },
  legendButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  legend: {
    position: 'absolute',
    left: 16,
    bottom: Platform.OS === 'ios' ? 180 : 190,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 9,
    minWidth: 150,
    maxWidth: 200,
  },
  legendDark: {
    backgroundColor: 'rgba(28, 28, 30, 0.98)',
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 10,
  },
  legendIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  textDark: {
    color: '#fff',
  },
});