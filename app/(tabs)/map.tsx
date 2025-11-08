import MonitoringMap from '@/components/MonitoringMap';
import { getAllMatrices } from '@/constants/monitoring';
import { useGPS } from '@/contexts/GPSContext';
import { useRealTimeLocation } from '@/hooks/useRealTimeLocation';
import { useRoutes } from '@/hooks/useRoutes';
import { useWorkSchedule } from '@/hooks/useWorkSchedule';
import { MonitoringPoint } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { routes } = useRoutes();
  
  // ✅ OBTENER PARÁMETROS DE NAVEGACIÓN DEL ROUTE-DETAIL
  const searchParams = useLocalSearchParams();
  
  // ✅ HOOKS PARA UBICACIÓN Y GPS - SOLO LECTURA
  const { 
    isTracking, 
    isLoading, 
    error: gpsError, 
    lastUpdate,
    clearError 
  } = useGPS();
  
  const { currentLocation } = useRealTimeLocation(isTracking ? 'cymperu' : null);
  const { workStatus, isInWorkHours } = useWorkSchedule('cymperu');
  
  const [selectedMatrix, setSelectedMatrix] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // ✅ ESTADOS SIMPLIFICADOS PARA CENTRADO DE MAPA
  const [centerCoords, setCenterCoords] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  
  // ✅ REF PARA EVITAR BUCLES INFINITOS
  const hasCenteredRef = useRef(false);
  const lastParamsRef = useRef<string>('');
  
  const panelAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // ✅ PROCESAR PARÁMETROS DE NAVEGACIÓN SIN CAUSAR BUCLES
  useEffect(() => {
    const paramsKey = `${searchParams.centerLat}-${searchParams.centerLng}-${searchParams.pointId}`;
    
    // Solo procesar si los parámetros cambiaron y no hemos centrado recientemente
    if (searchParams.centerLat && searchParams.centerLng && 
        paramsKey !== lastParamsRef.current && !hasCenteredRef.current) {
      
      console.log('🎯 Procesando nuevos parámetros:', searchParams);
      
      const lat = parseFloat(searchParams.centerLat as string);
      const lng = parseFloat(searchParams.centerLng as string);
      const latDelta = parseFloat(searchParams.latitudeDelta as string) || 0.002;
      const lngDelta = parseFloat(searchParams.longitudeDelta as string) || 0.002;
      
      console.log('🎯 Centrando en coordenadas:', lat, lng, 'con zoom:', latDelta);
      
      // ✅ MARCAR COMO PROCESADO PARA EVITAR BUCLES
      hasCenteredRef.current = true;
      lastParamsRef.current = paramsKey;
      
      // ✅ CONFIGURAR COORDENADAS PARA CENTRADO
      setCenterCoords({
        latitude: lat,
        longitude: lng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
      
      // ✅ SI VIENE DE UNA RUTA ESPECÍFICA, FILTRAR POR ESA RUTA
      if (searchParams.routeId && searchParams.focusMode === 'single' && routes.length > 0) {
        const route = routes.find(r => r.id === searchParams.routeId);
        if (route && route.monitoringPoints) {
          const point = route.monitoringPoints.find(p => p.id === searchParams.pointId);
          if (point) {
            console.log('🎯 Configurando filtro de matriz:', point.matrix);
            setSelectedMatrix(point.matrix);
          }
        }
      }
      
      // ✅ RESET DESPUÉS DE 3 SEGUNDOS SIN CAUSAR RE-RENDER
      setTimeout(() => {
        hasCenteredRef.current = false;
      }, 3000);
    }
    
    // ✅ SI VIENE PARA VER LA RUTA COMPLETA
    if (searchParams.viewMode === 'fullRoute' && searchParams.routeId) {
      console.log('🗺️ Modo ruta completa para ruta:', searchParams.routeId);
      setSelectedMatrix(null); // Ver todos los puntos
    }
  }, [searchParams.centerLat, searchParams.centerLng, searchParams.pointId, routes.length]);

  // ✅ LIMPIAR ERRORES GPS AUTOMÁTICAMENTE
  useEffect(() => {
    if (gpsError) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [gpsError, clearError]);

  const allPoints: MonitoringPoint[] = useMemo(() => {
    return routes.flatMap(route => route.monitoringPoints || []);
  }, [routes]);

  const filteredPoints = useMemo(() => {
    return selectedMatrix
      ? allPoints.filter(point => point.matrix === selectedMatrix)
      : allPoints;
  }, [allPoints, selectedMatrix]);

  const matrixCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allPoints.forEach(point => {
      counts[point.matrix] = (counts[point.matrix] || 0) + 1;
    });
    return counts;
  }, [allPoints]);

  // ✅ ESTADÍSTICAS POR ESTADO CORREGIDAS
  const statusCounts = useMemo(() => {
    const completed = allPoints.filter(p => p.status === 'completed').length;
    const pending = allPoints.filter(p => p.status === 'pending').length;
    
    return { completed, pending };
  }, [allPoints]);

  const matrices = getAllMatrices();

  const openPanel = () => {
    setIsPanelOpen(true);
    Animated.parallel([
      Animated.spring(panelAnimation, {
        toValue: SCREEN_HEIGHT - PANEL_HEIGHT,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePanel = () => {
    Animated.parallel([
      Animated.spring(panelAnimation, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsPanelOpen(false));
  };

  const handleMatrixSelect = (matrixId: string | null) => {
    setSelectedMatrix(matrixId);
    closePanel();
  };

  const selectedMatrixData = selectedMatrix 
    ? matrices.find(m => m.id === selectedMatrix)
    : null;

  const listData = [
    { type: 'all', key: 'all' },
    { type: 'divider', key: 'divider' },
    ...matrices.filter(m => (matrixCounts[m.id] || 0) > 0).map(m => ({ type: 'matrix', key: m.id, data: m })),
    { type: 'stats', key: 'stats' },
  ];

  const renderItem = ({ item }: any) => {
    if (item.type === 'all') {
      return (
        <TouchableOpacity
          style={[styles.matrixCard, isDark && styles.matrixCardDark, selectedMatrix === null && styles.matrixCardActive]}
          onPress={() => handleMatrixSelect(null)}
          activeOpacity={0.7}
        >
          <View style={styles.matrixCardLeft}>
            <View style={[styles.matrixIconCircle, selectedMatrix === null && styles.matrixIconCircleActive]}>
              <Ionicons name="grid" size={22} color={selectedMatrix === null ? '#fff' : '#4CAF50'} />
            </View>
            <View style={styles.matrixInfo}>
              <Text style={[styles.matrixName, isDark && styles.textDark, selectedMatrix === null && styles.matrixNameActive]}>
                Todas las matrices
              </Text>
              <Text style={[styles.matrixDescription, isDark && styles.textSecondaryDark, selectedMatrix === null && styles.matrixDescriptionActive]}>
                Ver todos los puntos de monitoreo
              </Text>
            </View>
          </View>
          <View style={[styles.countBadge, selectedMatrix === null && styles.countBadgeActive]}>
            <Text style={[styles.countText, selectedMatrix === null && styles.countTextActive]}>
              {allPoints.length}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'divider') {
      return (
        <View style={styles.divider}>
          <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
          <Text style={[styles.dividerText, isDark && styles.textSecondaryDark]}>POR TIPO DE MATRIZ</Text>
          <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
        </View>
      );
    }

    if (item.type === 'matrix') {
      const matrix = item.data;
      const count = matrixCounts[matrix.id] || 0;
      const isSelected = selectedMatrix === matrix.id;

      return (
        <TouchableOpacity
          style={[styles.matrixCard, isDark && styles.matrixCardDark, isSelected && styles.matrixCardActive, isSelected && { backgroundColor: matrix.color }]}
          onPress={() => handleMatrixSelect(matrix.id)}
          activeOpacity={0.7}
        >
          <View style={styles.matrixCardLeft}>
            <View style={[styles.matrixIconCircle, !isSelected && { backgroundColor: matrix.lightBackground }, isSelected && styles.matrixIconCircleActive]}>
              <Ionicons name={matrix.icon} size={22} color={isSelected ? '#fff' : matrix.color} />
            </View>
            <View style={styles.matrixInfo}>
              <Text style={[styles.matrixName, isDark && styles.textDark, isSelected && styles.matrixNameActive]}>
                {matrix.name}
              </Text>
              <Text style={[styles.matrixDescription, isDark && styles.textSecondaryDark, isSelected && styles.matrixDescriptionActive]}>
                {matrix.description}
              </Text>
            </View>
          </View>
          <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
            <Text style={[styles.countText, isSelected && styles.countTextActive]}>{count}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'stats') {
      return (
        <View style={styles.statsSection}>
          <Text style={[styles.statsTitle, isDark && styles.textDark]}>Resumen por Estado</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, isDark && styles.statCardDark]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              </View>
              <Text style={[styles.statNumber, isDark && styles.textDark]}>
                {statusCounts.completed}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Completados</Text>
            </View>
            <View style={[styles.statCard, isDark && styles.statCardDark]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="time" size={22} color="#6B7280" />
              </View>
              <Text style={[styles.statNumber, isDark && styles.textDark]}>
                {statusCounts.pending}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Pendientes</Text>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* MAPA CON PARÁMETROS DE CENTRADO */}
      <View style={styles.mapContainer}>
        {filteredPoints.length > 0 ? (
          <MonitoringMap
            points={filteredPoints}
            currentLocation={currentLocation}
            isTracking={isTracking}
            workStatus={workStatus}
            isInWorkHours={isInWorkHours}
            showRoute={false}
            showLegend={false}
            showGPSControls={true}
            selectedMatrix={selectedMatrix}
            // ✅ PASAR PARÁMETROS DE CENTRADO SIN CAUSAR BUCLES
            shouldCenterOnUser={false} // ✅ SIEMPRE FALSE PARA EVITAR CONFLICTOS
            centerCoordinates={centerCoords}
            onPointPress={(point) => {
              const route = routes.find(r => 
                r.monitoringPoints?.some(p => p.id === point.id)
              );
              if (route) {
                router.push(`/route-detail/${route.id}`);
              }
            }}
          />
        ) : (
          <View style={styles.emptyMap}>
            <Ionicons name="map-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No hay puntos de monitoreo</Text>
          </View>
        )}
      </View>

      {/* ✅ BARRA DE BÚSQUEDA CON INFO DE NAVEGACIÓN */}
      <View style={styles.searchBarWrapper}>
        <TouchableOpacity 
          style={[styles.searchBar, isDark && styles.searchBarDark]}
          onPress={openPanel}
          activeOpacity={0.9}
        >
          <Ionicons name="location" size={22} color="#4CAF50" />
          <View style={styles.searchBarContent}>
            <Text style={[styles.searchBarTitle, isDark && styles.textDark]}>
              {searchParams.pointName 
                ? `📍 ${searchParams.pointName}`
                : selectedMatrixData 
                  ? selectedMatrixData.name 
                  : 'Puntos de Monitoreo'
              }
            </Text>
            <Text style={[styles.searchBarSubtitle, isDark && styles.textSecondaryDark]}>
              {searchParams.pointIndex 
                ? `Punto #${searchParams.pointIndex} • Zoom cercano`
                : `${filteredPoints.length} puntos`
              }
              {isTracking && ' • GPS 🟢'}
              {isLoading && ' • Cargando...'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={isDark ? '#999' : '#666'} />
        </TouchableOpacity>
      </View>

      {/* ✅ BANNER DE ERROR GPS MEJORADO */}
      {gpsError && (
        <Animated.View style={styles.errorBanner}>
          <View style={styles.errorContent}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.errorText}>GPS: {gpsError}</Text>
            <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Overlay con opacidad */}
      {isPanelOpen && (
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }) }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />
        </Animated.View>
      )}

      {/* Panel inferior deslizable */}
      <Animated.View style={[styles.panel, isDark && styles.panelDark, { transform: [{ translateY: panelAnimation }] }]}>
        <TouchableOpacity style={styles.handleContainer} onPress={closePanel} activeOpacity={0.7}>
          <View style={[styles.handle, isDark && styles.handleDark]} />
        </TouchableOpacity>

        <View style={[styles.panelHeader, isDark && styles.panelHeaderDark]}>
          <View style={styles.panelHeaderLeft}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="filter" size={20} color="#4CAF50" />
            </View>
            <View>
              <Text style={[styles.panelTitle, isDark && styles.textDark]}>Filtrar Puntos</Text>
              <Text style={[styles.panelSubtitle, isDark && styles.textSecondaryDark]}>
                Selecciona una matriz de monitoreo
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={closePanel} style={[styles.closeButton, isDark && styles.closeButtonDark]}>
            <Ionicons name="close" size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.panelContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle={isDark ? 'white' : 'black'}
          bounces={true}
          removeClippedSubviews={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          scrollIndicatorInsets={{ right: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// ✅ ESTILOS IGUALES (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    flex: 1,
  },
  emptyMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  searchBarWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 40) + 20,
    left: 16,
    right: 16,
    zIndex: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
  },
  searchBarDark: {
    backgroundColor: '#2c2c2e',
  },
  searchBarContent: {
    flex: 1,
  },
  searchBarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  searchBarSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  
  // ✅ BANNER DE ERROR MEJORADO
  errorBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 140,
    left: 16,
    right: 16,
    backgroundColor: '#f44336',
    borderRadius: 8,
    zIndex: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  errorCloseButton: {
    padding: 4,
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  panelDark: {
    backgroundColor: '#1c1c1e',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d0d0d0',
  },
  handleDark: {
    backgroundColor: '#3a3a3c',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  panelHeaderDark: {
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 250,
  },
  matrixCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  matrixCardDark: {
    backgroundColor: '#2c2c2e',
  },
  matrixCardActive: {
    backgroundColor: '#4CAF50',
  },
  matrixCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  matrixIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixIconCircleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  matrixInfo: {
    flex: 1,
  },
  matrixName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 3,
  },
  matrixNameActive: {
    color: '#fff',
  },
  matrixDescription: {
    fontSize: 12,
    color: '#666',
  },
  matrixDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  countBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4CAF50',
  },
  countTextActive: {
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerLineDark: {
    backgroundColor: '#3a3a3c',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
  },
  statsSection: {
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statCardDark: {
    backgroundColor: '#2c2c2e',
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});