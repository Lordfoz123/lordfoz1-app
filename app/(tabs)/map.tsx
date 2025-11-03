import MonitoringMap from '@/components/MonitoringMap';
import { getAllMatrices } from '@/constants/monitoring';
import { useRoutes } from '@/hooks/useRoutes';
import { MonitoringPoint } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
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
  const [selectedMatrix, setSelectedMatrix] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  
  const panelAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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

  const matrices = getAllMatrices();

  const openPanel = () => {
    setIsPanelOpen(true);
    setIsLegendVisible(false);
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
          <Text style={[styles.statsTitle, isDark && styles.textDark]}>Resumen</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, isDark && styles.statCardDark]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
              </View>
              <Text style={[styles.statNumber, isDark && styles.textDark]}>
                {allPoints.filter(p => p.status === 'completed').length}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Completados</Text>
            </View>
            <View style={[styles.statCard, isDark && styles.statCardDark]}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time" size={22} color="#FF9800" />
              </View>
              <Text style={[styles.statNumber, isDark && styles.textDark]}>
                {allPoints.filter(p => p.status === 'pending').length}
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

      {/* Mapa en pantalla completa */}
      <View style={styles.mapContainer}>
        {filteredPoints.length > 0 ? (
          <MonitoringMap
            points={filteredPoints}
            showRoute={false}
            showLegend={false}
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

      {/* Barra flotante estilo Google Maps */}
      <View style={styles.searchBarWrapper}>
        <TouchableOpacity 
          style={[styles.searchBar, isDark && styles.searchBarDark]}
          onPress={openPanel}
          activeOpacity={0.9}
        >
          <Ionicons name="location" size={22} color="#4CAF50" />
          <View style={styles.searchBarContent}>
            <Text style={[styles.searchBarTitle, isDark && styles.textDark]}>
              {selectedMatrixData ? selectedMatrixData.name : 'Puntos de Monitoreo'}
            </Text>
            <Text style={[styles.searchBarSubtitle, isDark && styles.textSecondaryDark]}>
              {filteredPoints.length} puntos visibles
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={isDark ? '#999' : '#666'} />
        </TouchableOpacity>
      </View>

      {/* BOTÓN DE LEYENDA - ESTILO NATIVO BLANCO */}
      {!isPanelOpen && (
        <TouchableOpacity 
          style={[styles.legendButton, isLegendVisible && styles.legendButtonActive]}
          onPress={() => setIsLegendVisible(!isLegendVisible)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isLegendVisible ? "information-circle" : "information-circle-outline"}
            size={26} 
            color={isLegendVisible ? '#4CAF50' : '#666'} 
          />
        </TouchableOpacity>
      )}

      {/* LEYENDA - ESQUINA INFERIOR IZQUIERDA */}
      {!isPanelOpen && isLegendVisible && (
        <View style={[styles.legend, isDark && styles.legendDark]}>
          <View style={styles.legendHeader}>
            <Ionicons name="layers" size={16} color={isDark ? '#fff' : '#333'} />
            <Text style={[styles.legendTitle, isDark && styles.textDark]}>Matrices</Text>
          </View>
          {matrices.map((config, idx) => (
            <View key={`legend-${idx}`} style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: config.color }]}>
                <Ionicons name={config.icon} size={14} color="#fff" />
              </View>
              <Text style={[styles.legendText, isDark && styles.textDark]}>{config.name}</Text>
            </View>
          ))}
        </View>
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
legendButton: {
  position: 'absolute',
  bottom: Platform.OS === 'ios' ? 75 : 85,  // ← AÚN MÁS CERCA del botón nativo
  right: 10,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 8,
},
legendButtonActive: {
  backgroundColor: '#E8F5E9',
},
legend: {
  position: 'absolute',
  bottom: Platform.OS === 'ios' ? 20 : 30,  // ← MÁS ABAJO, cerca del TabBar
  left: 16,
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
  textSecondaryDark: {
    color: '#999',
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