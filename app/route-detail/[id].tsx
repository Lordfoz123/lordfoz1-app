import { RoutePreview } from '@/components/RoutePreview';
import { useGPS } from '@/contexts/GPSContext';
import { useRealTimeLocation } from '@/hooks/useRealTimeLocation';
import { db } from '@/services/firebase';
import { Route } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // ✅ ESTADOS PARA NAVEGACIÓN DIRECTA
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [selectedPointForNav, setSelectedPointForNav] = useState<any>(null);

  // ✅ HOOKS PARA GPS Y UBICACIÓN
  const { isTracking } = useGPS();
  const { currentLocation } = useRealTimeLocation(isTracking ? 'cymperu' : null);

  // ✅ ANIMACIONES NATIVAS PARA ROUTE PREVIEW
  const routeSheetAnimation = useRef(new Animated.Value(300)).current;
  const routeOverlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        console.log('🔄 Cargando ruta con ID:', id);
        const routeDoc = await getDoc(doc(db, 'routes', id as string));
        if (routeDoc.exists()) {
          const data = routeDoc.data();
          setRoute({
            id: routeDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            scheduledDate: data.scheduledDate?.toDate(),
          } as Route);
          console.log('✅ Ruta cargada:', data.name);
        } else {
          console.log('❌ Ruta no encontrada');
        }
      } catch (error) {
        console.error('❌ Error al cargar ruta:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoute();
    }
  }, [id]);

  // ✅ FUNCIÓN PARA NAVEGAR A UN PUNTO ESPECÍFICO CON ZOOM MUY CERCANO
  const navigateToPoint = (point: any, index: number) => {
    console.log('🎯 Navegando a punto:', point.name, 'Coordenadas:', point.location);
    
    router.push({
      pathname: '/(tabs)/map',
      params: {
        centerLat: point.location.latitude.toString(),
        centerLng: point.location.longitude.toString(),
        pointId: point.id,
        pointName: point.name,
        pointIndex: (index + 1).toString(),
        routeId: route?.id,
        zoomLevel: 'veryClose',
        latitudeDelta: '0.002',
        longitudeDelta: '0.002',
        focusMode: 'single',
      }
    });
  };

  // ✅ FUNCIÓN PARA NAVEGACIÓN DIRECTA CON ANIMACIONES NATIVAS
  const showDirectNavigation = (point: any) => {
    if (!currentLocation) {
      alert('GPS no disponible. Activa la ubicación para usar navegación.');
      return;
    }
    
    setSelectedPointForNav(point);
    setShowNavigationPanel(true);
    
    // ✅ ANIMACIÓN NATIVA AL ABRIR (IGUAL QUE EN EL MAPA)
    Animated.parallel([
      Animated.spring(routeSheetAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(routeOverlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeNavigationPanel = () => {
    // ✅ ANIMACIÓN NATIVA AL CERRAR
    Animated.parallel([
      Animated.spring(routeSheetAnimation, {
        toValue: 300,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(routeOverlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowNavigationPanel(false);
      setSelectedPointForNav(null);
    });
  };

  // ✅ FUNCIÓN PARA VER TODA LA RUTA EN EL MAPA
  const viewRouteOnMap = () => {
    console.log('🗺️ Viendo ruta completa en mapa');
    
    router.push({
      pathname: '/(tabs)/map',
      params: {
        routeId: route?.id,
        viewMode: 'fullRoute',
        selectedMatrix: null,
      }
    });
  };

  // ✅ CALCULAR REGIÓN DEL MINI MAPA PARA MOSTRAR TODA LA RUTA
  const getMapRegion = () => {
    if (!route?.monitoringPoints || route.monitoringPoints.length === 0) {
      return {
        latitude: -12.0464,
        longitude: -77.0428,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const points = route.monitoringPoints;
    const lats = points.map(p => p.location.latitude);
    const lngs = points.map(p => p.location.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.4;
    const deltaLng = (maxLng - minLng) * 1.4;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Cargando ruta...
        </Text>
      </View>
    );
  }

  if (!route) {
    return (
      <View style={[styles.errorContainer, isDark && styles.errorContainerDark]}>
        <Ionicons name="alert-circle-outline" size={64} color={isDark ? '#666' : '#ccc'} />
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Ruta no encontrada
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'pending': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  // ✅ OBTENER COLOR DEL PUNTO SEGÚN ESTADO
  const getPointStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#6B7280';
      case 'in-progress': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Detalle de Ruta
          </Text>
          {/* ✅ BOTÓN PARA VER RUTA COMPLETA EN MAPA */}
          <TouchableOpacity
            style={styles.mapIconButton}
            onPress={viewRouteOnMap}
          >
            <Ionicons name="map" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información principal */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.routeName, isDark && styles.routeNameDark]}>
            {route.name}
          </Text>
          {route.description && (
            <Text style={[styles.description, isDark && styles.descriptionDark]}>
              {route.description}
            </Text>
          )}

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(route.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(route.status) }]}>
                {getStatusLabel(route.status)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(route.priority) + '20' }]}>
              <Text style={[styles.badgeText, { color: getPriorityColor(route.priority) }]}>
                Prioridad: {getPriorityLabel(route.priority)}
              </Text>
            </View>
          </View>
        </View>

        {/* ✅ MINI MAPA DE RUTA COMPLETA */}
        {route.monitoringPoints && route.monitoringPoints.length > 0 && (
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.mapHeader}>
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                Vista de Ruta
              </Text>
              <TouchableOpacity
                style={styles.fullMapButton}
                onPress={viewRouteOnMap}
              >
                <Text style={styles.fullMapButtonText}>Ver completo</Text>
                <Ionicons name="open-outline" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>

            <View style={styles.miniMapContainer}>
              <MapView
                style={styles.miniMap}
                provider={PROVIDER_GOOGLE}
                region={getMapRegion()}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
              >
                {/* ✅ MARCADORES DE TODOS LOS PUNTOS */}
                {route.monitoringPoints.map((point, index) => (
                  <Marker
                    key={`minimap-${point.id}-${index}`}
                    coordinate={{
                      latitude: point.location.latitude,
                      longitude: point.location.longitude,
                    }}
                  >
                    <View style={styles.miniMarker}>
                      <View style={[
                        styles.miniMarkerInner,
                        { backgroundColor: getPointStatusColor(point.status) }
                      ]}>
                        {point.status === 'completed' ? (
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        ) : (
                          <Text style={styles.miniMarkerText}>{index + 1}</Text>
                        )}
                      </View>
                    </View>
                  </Marker>
                ))}

                {/* ✅ LÍNEA CONECTANDO TODOS LOS PUNTOS */}
                <Polyline
                  coordinates={route.monitoringPoints.map(p => ({
                    latitude: p.location.latitude,
                    longitude: p.location.longitude,
                  }))}
                  strokeColor="#4CAF50"
                  strokeWidth={2}
                  strokePattern={[5, 5]}
                />
              </MapView>

              {/* ✅ OVERLAY CLICKEABLE PARA ABRIR MAPA COMPLETO */}
              <TouchableOpacity
                style={styles.mapOverlay}
                onPress={viewRouteOnMap}
                activeOpacity={0.8}
              >
                <View style={styles.mapOverlayContent}>
                  <Ionicons name="expand" size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.mapOverlayText}>Tocar para ampliar</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Estadísticas */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Estadísticas
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="location" size={24} color="#2196F3" />
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {route.completedPoints}/{route.totalPoints}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                Puntos
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="navigate" size={24} color="#4CAF50" />
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {route.totalDistance} km
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                Distancia
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#FF9800" />
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {route.estimatedTime} min
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                Tiempo est.
              </Text>
            </View>
          </View>

          {/* Progreso */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, isDark && styles.progressLabelDark]}>
                Progreso
              </Text>
              <Text style={[styles.progressPercentage, isDark && styles.progressPercentageDark]}>
                {Math.round((route.completedPoints / route.totalPoints) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(route.completedPoints / route.totalPoints) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ✅ PUNTOS DE MONITOREO CON NAVEGACIÓN INTEGRADA */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Puntos de Monitoreo ({route.monitoringPoints?.length || 0})
          </Text>

          {route.monitoringPoints && route.monitoringPoints.length > 0 ? (
            route.monitoringPoints.map((point, index) => (
              <View
                key={`point-${point.id}-${index}`}
                style={[styles.pointCard, isDark && styles.pointCardDark]}
              >
                <View style={styles.pointHeader}>
                  <View style={styles.pointLeft}>
                    <View style={[
                      styles.pointSequenceCircle,
                      { backgroundColor: getPointStatusColor(point.status) }
                    ]}>
                      {point.status === 'completed' ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      ) : (
                        <Text style={styles.pointSequenceText}>
                          #{index + 1}
                        </Text>
                      )}
                    </View>
                    <View style={styles.pointInfo}>
                      <Text style={[styles.pointName, isDark && styles.pointNameDark]}>
                        {point.name}
                      </Text>
                      <Text style={[styles.pointAddress, isDark && styles.pointAddressDark]}>
                        {point.address}
                      </Text>
                      <Text style={[styles.pointCoordinates, isDark && styles.pointCoordinatesDark]}>
                        📍 {point.location.latitude.toFixed(5)}, {point.location.longitude.toFixed(5)}
                      </Text>
                    </View>
                  </View>
                </View>

                {point.monitoringData?.parameters && (
                  <View style={styles.parametersContainer}>
                    <Text style={[styles.parametersLabel, isDark && styles.parametersLabelDark]}>
                      Parámetros:
                    </Text>
                    <Text style={[styles.parametersText, isDark && styles.parametersTextDark]}>
                      {point.monitoringData.parameters.join(', ')}
                    </Text>
                  </View>
                )}

                {/* ✅ BOTONES DE NAVEGACIÓN */}
                <View style={styles.navigationButtons}>
                  <TouchableOpacity
                    style={[styles.navButton, styles.directNavButton]}
                    onPress={() => showDirectNavigation(point)}
                    disabled={!currentLocation}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.navButtonText}>
                      {currentLocation ? 'Ir aquí' : 'GPS Off'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.navButton, styles.mapNavButton]}
                    onPress={() => navigateToPoint(point, index)}
                  >
                    <Ionicons name="map" size={16} color="#fff" />
                    <Text style={styles.navButtonText}>Ver en mapa</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.pointFooter}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getPointStatusColor(point.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: getPointStatusColor(point.status) }
                    ]}>
                      {point.status === 'completed' ? 'Completado' : 
                       point.status === 'pending' ? 'Pendiente' : 'En progreso'}
                    </Text>
                  </View>
                  <View style={styles.gpsStatus}>
                    <Ionicons 
                      name={currentLocation ? "location" : "location-outline"} 
                      size={14} 
                      color={currentLocation ? "#4CAF50" : "#999"} 
                    />
                    <Text style={[styles.gpsStatusText, { color: currentLocation ? "#4CAF50" : "#999" }]}>
                      {currentLocation ? 'GPS Activo' : 'GPS Inactivo'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={isDark ? '#666' : '#ccc'} />
              <Text style={[styles.noPointsText, isDark && styles.noPointsTextDark]}>
                No hay puntos de monitoreo asignados
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ✅ PANEL DE NAVEGACIÓN DIRECTA CON ANIMACIONES NATIVAS */}
      {showNavigationPanel && selectedPointForNav && currentLocation && (
        <>
          {/* OVERLAY OPACO ANIMADO */}
          <Animated.View
            style={[
              styles.navigationOverlay,
              { opacity: routeOverlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeNavigationPanel} />
          </Animated.View>

          {/* SHEET ANIMADO */}
          <Animated.View
            style={[
              styles.routeSheetContainer,
              { transform: [{ translateY: routeSheetAnimation }] }
            ]}
          >
            <RoutePreview
              currentLocation={currentLocation}
              destination={{
                latitude: selectedPointForNav.location.latitude,
                longitude: selectedPointForNav.location.longitude,
              }}
              destinationName={selectedPointForNav.name}
              onClose={closeNavigationPanel}
              // ✅ NO PASAR onShowDetails aquí porque ya estamos en el detail
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerDark: {
    backgroundColor: '#1c1c1e',
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerTitleDark: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
  },
  routeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    lineHeight: 30,
  },
  routeNameDark: {
    color: '#fff',
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  descriptionDark: {
    color: '#999',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ✅ ESTILOS DEL MINI MAPA
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  fullMapButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  miniMapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  miniMap: {
    flex: 1,
  },
  miniMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMarkerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  miniMarkerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlayContent: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapOverlayText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  cardTitleDark: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statValueDark: {
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statLabelDark: {
    color: '#999',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressLabelDark: {
    color: '#999',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressPercentageDark: {
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },

  // ✅ ESTILOS DE PUNTOS CON NAVEGACIÓN
  pointCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pointCardDark: {
    backgroundColor: '#2c2c2e',
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pointLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  pointSequenceCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pointSequenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  pointNameDark: {
    color: '#fff',
  },
  pointAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  pointAddressDark: {
    color: '#999',
  },
  pointCoordinates: {
    fontSize: 11,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pointCoordinatesDark: {
    color: '#666',
  },
  parametersContainer: {
    marginBottom: 12,
    paddingLeft: 48,
  },
  parametersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  parametersLabelDark: {
    color: '#999',
  },
  parametersText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  parametersTextDark: {
    color: '#999',
  },

  // ✅ BOTONES DE NAVEGACIÓN
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingLeft: 48,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  directNavButton: {
    backgroundColor: '#4CAF50',
  },
  mapNavButton: {
    backgroundColor: '#2196F3',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  pointFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 48,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gpsStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ✅ ANIMACIONES NATIVAS PARA ROUTE PREVIEW
  routeSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
  },
  navigationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPointsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  noPointsTextDark: {
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingContainerDark: {
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  loadingTextDark: {
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorContainerDark: {
    backgroundColor: '#000',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorTextDark: {
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});