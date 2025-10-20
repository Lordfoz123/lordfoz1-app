import { FloatingButton } from '@/components/map/FloatingButton';
import { BaseColors, BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import {
    ChevronDown,
    Crosshair,
    Layers,
    List,
    MapPin,
    Navigation as NavigationIcon,
    Route,
    X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const mockPoints = [
  { id: '1', name: 'Centro Comercial Plaza Norte', lat: -12.0464, lng: -77.0428, status: 'completed', address: 'Av. Alfredo Mendiola 1400' },
  { id: '2', name: 'Parque Kennedy', lat: -12.0474, lng: -77.0438, status: 'completed', address: 'Miraflores, Lima' },
  { id: '3', name: 'Municipalidad de San Isidro', lat: -12.0484, lng: -77.0448, status: 'completed', address: 'Av. Rivera Navarrete 740' },
  { id: '4', name: 'Mall del Sur', lat: -12.0494, lng: -77.0458, status: 'next', number: 4, address: 'Av. Caminos del Inca 1385' },
  { id: '5', name: 'Jockey Plaza', lat: -12.0504, lng: -77.0468, status: 'pending', number: 5, address: 'Av. Javier Prado Este 4200' },
  { id: '6', name: 'Real Plaza Salaverry', lat: -12.0514, lng: -77.0478, status: 'pending', number: 6, address: 'Av. Salaverry 2370' },
];

export default function MapScreen() {
  const { colors, isDark, shadow } = useThemeColor();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPoints, setShowPoints] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentLocation();
    startLocationTracking();
    
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status.granted !== true) return;

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (newLocation) => {
          setLocation(newLocation);
          
          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              action: 'updateUserLocation',
              lat: newLocation.coords.latitude,
              lng: newLocation.coords.longitude,
            }));
          }
        }
      );
    } catch (error) {
      console.error('Error iniciando tracking:', error);
    }
  };

  const centerOnUserLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (location && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        action: 'centerUser',
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      }));
    }
  };

  const openPointsList = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePointsList = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const centerOnPoint = (point: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        action: 'centerPoint',
        lat: point.lat,
        lng: point.lng,
      }));
    }
    setSelectedPoint(point);
    closePointsList();
  };

  const togglePointsVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPoints(!showPoints);
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        action: 'togglePoints',
        show: !showPoints,
      }));
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.action === 'markerClick') {
        const point = mockPoints.find(p => p.id === data.pointId);
        if (point) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedPoint(point);
        }
      } else if (data.action === 'mapLoaded') {
        setMapLoaded(true);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const closeBottomSheet = () => {
    setSelectedPoint(null);
  };

  const navigateToPoint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Navegando a:', selectedPoint?.name);
  };

  const traceRoute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Trazando ruta a:', selectedPoint?.name);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return BaseColors.pointCompleted;
      case 'next': return BaseColors.pointNext;
      case 'pending': return BaseColors.pointPending;
      default: return BaseColors.pointInactive;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'next': return 'Siguiente';
      case 'pending': return 'Pendiente';
      default: return 'Inactivo';
    }
  };

  const mapTileUrl = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          margin: 0; 
          padding: 0; 
          background: ${isDark ? '#0A0A0A' : '#FFFFFF'}; 
          overflow: hidden;
        }
        #map { width: 100vw; height: 100vh; }
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
        }
        .pulse-marker {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-dot {
          width: 14px;
          height: 14px;
          background: #1AA34A;
          border-radius: 50%;
          border: 3px solid white;
          position: relative;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .pulse-wave {
          position: absolute;
          width: 24px;
          height: 24px;
          background: #1DB954;
          border-radius: 50%;
          opacity: 0;
          animation: pulse 2s infinite;
        }
        .pulse-wave:nth-child(2) { animation-delay: 0.6s; }
        .pulse-wave:nth-child(3) { animation-delay: 1.2s; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .point-marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: transform 0.2s;
          cursor: pointer;
        }
        .point-marker:active { transform: scale(1.1); }
        .point-completed { background: #10B981; }
        .point-next { 
          background: #F59E0B;
          animation: nextPulse 2s infinite;
        }
        .point-pending { background: #3B82F6; }
        @keyframes nextPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
          50% { transform: scale(1.15); box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const userLat = ${location?.coords.latitude || -12.0464};
        const userLng = ${location?.coords.longitude || -77.0428};
        const points = ${JSON.stringify(mockPoints)};
        
        const map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          maxZoom: 19,
          minZoom: 10,
        }).setView([userLat, userLng], 15);
        
        L.tileLayer('${mapTileUrl}', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);
        
        const userIcon = L.divIcon({
          className: 'pulse-marker',
          html: '<div class="pulse-wave"></div><div class="pulse-wave"></div><div class="pulse-wave"></div><div class="pulse-dot"></div>',
          iconSize: [80, 80],
        });
        
        const userMarker = L.marker([userLat, userLng], { 
          icon: userIcon,
          zIndexOffset: 1000
        }).addTo(map);
        
        const pointMarkers = [];
        points.forEach(point => {
          const statusClass = 'point-' + point.status;
          const content = point.number ? point.number : '✓';
          
          const pointIcon = L.divIcon({
            className: '',
            html: '<div class="point-marker ' + statusClass + '">' + content + '</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          
          const marker = L.marker([point.lat, point.lng], { 
            icon: pointIcon,
            riseOnHover: true
          })
            .addTo(map)
            .on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                action: 'markerClick',
                pointId: point.id
              }));
            });
          
          pointMarkers.push({ marker, id: point.id });
        });
        
        window.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.action === 'centerUser') {
              map.flyTo([data.lat, data.lng], 16, { duration: 1, easeLinearity: 0.25 });
              userMarker.setLatLng([data.lat, data.lng]);
            } else if (data.action === 'centerPoint') {
              map.flyTo([data.lat, data.lng], 17, { duration: 1, easeLinearity: 0.25 });
            } else if (data.action === 'updateUserLocation') {
              userMarker.setLatLng([data.lat, data.lng]);
            } else if (data.action === 'togglePoints') {
              pointMarkers.forEach(({ marker }) => {
                if (data.show) {
                  marker.addTo(map);
                } else {
                  marker.remove();
                }
              });
            }
          } catch (error) {
            console.error('Error:', error);
          }
        });
        
        setTimeout(() => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            action: 'mapLoaded'
          }));
        }, 500);
      </script>
    </body>
    </html>
  `;

  const isModalOpen = slideAnim._value < SCREEN_HEIGHT;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent"
        translucent
      />
      
      <View style={[styles.header, { backgroundColor: colors.cardBg }, shadow.md]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={openPointsList}
        >
          <View style={styles.headerLeft}>
            <MapPin size={20} color={BaseColors.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {selectedPoint ? selectedPoint.name : 'Puntos de Monitoreo'}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {showPoints ? `${mockPoints.length} puntos visibles` : 'Puntos ocultos'}
              </Text>
            </View>
          </View>
          <ChevronDown 
            size={20} 
            color={colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {!mapLoaded && (
        <View style={[styles.loadingContainer, { backgroundColor: colors.bgSecondary }]}>
          <ActivityIndicator size="large" color={BaseColors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando mapa...</Text>
        </View>
      )}

      <View style={styles.floatingButtons}>
        <FloatingButton
          icon={<Crosshair size={20} color={BaseColors.primary} />}
          onPress={centerOnUserLocation}
        />
        <FloatingButton
          icon={<List size={20} color={showPoints ? BaseColors.primary : colors.textSecondary} />}
          onPress={togglePointsVisibility}
          active={showPoints}
        />
        <FloatingButton
          icon={<Layers size={20} color={colors.textSecondary} />}
          onPress={() => console.log('Capas')}
        />
      </View>

      <Animated.View 
        style={[
          styles.modalOverlay,
          { 
            opacity: opacityAnim,
            pointerEvents: isModalOpen ? 'auto' : 'none',
          }
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closePointsList}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.pointsListContainer,
          { 
            backgroundColor: colors.cardBg,
            transform: [{ translateY: slideAnim }],
          },
          shadow.lg,
        ]}
      >
        <View style={[styles.modalHandle, { backgroundColor: colors.bgTertiary }]} />
        
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Puntos de Monitoreo
          </Text>
          <TouchableOpacity onPress={closePointsList} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={mockPoints}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pointItem, { borderBottomColor: colors.borderColor }]}
              onPress={() => centerOnPoint(item)}
            >
              <View style={styles.pointItemLeft}>
                <View style={[styles.pointItemBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.pointItemBadgeText}>{item.number || '✓'}</Text>
                </View>
                <View style={styles.pointItemInfo}>
                  <Text style={[styles.pointItemName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.pointItemAddress, { color: colors.textSecondary }]}>{item.address}</Text>
                  <Text style={[styles.pointItemStatus, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
              <NavigationIcon size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {selectedPoint && (
        <>
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1}
            onPress={closeBottomSheet}
          />
          
          <View style={[styles.bottomSheet, { backgroundColor: colors.cardBg }, shadow.lg]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: colors.bgTertiary }]} />
            
            <View style={styles.bottomSheetContent}>
              <View style={styles.pointHeader}>
                <View style={[
                  styles.pointBadge,
                  { backgroundColor: getStatusColor(selectedPoint.status) }
                ]}>
                  <Text style={styles.pointBadgeText}>
                    {selectedPoint.number || '✓'}
                  </Text>
                </View>
                <View style={styles.pointInfo}>
                  <Text style={[styles.pointName, { color: colors.textPrimary }]}>{selectedPoint.name}</Text>
                  <Text style={[styles.pointAddress, { color: colors.textSecondary }]}>{selectedPoint.address}</Text>
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedPoint.status) }]} />
                    <Text style={[styles.pointStatus, { color: colors.textSecondary }]}>
                      {getStatusLabel(selectedPoint.status)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeBottomSheet}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.pointDetails, { backgroundColor: colors.bgSecondary }]}>
                <View style={styles.detailRow}>
                  <NavigationIcon size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>2.3 km de distancia</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>Tiempo estimado: 8 min</Text>
                </View>
              </View>

              {selectedPoint.status !== 'completed' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: BaseColors.primary }]}
                    onPress={navigateToPoint}
                  >
                    <NavigationIcon size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Navegar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.bgTertiary }]}
                    onPress={traceRoute}
                  >
                    <Route size={20} color={BaseColors.primary} />
                    <Text style={[styles.actionButtonTextSecondary, { color: colors.textPrimary }]}>Trazar Ruta</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 100,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  floatingButtons: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 120,
    gap: Spacing.sm,
    zIndex: 10,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },
  pointsListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    zIndex: 60,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  pointItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  pointItemBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointItemBadgeText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pointItemInfo: {
    flex: 1,
  },
  pointItemName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  pointItemAddress: {
    fontSize: FontSizes.xs,
    marginBottom: 4,
  },
  pointItemStatus: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 20,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    zIndex: 30,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  bottomSheetContent: {
    gap: Spacing.md,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  pointBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointBadgeText: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: FontSizes.sm,
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pointStatus: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  pointDetails: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSizes.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  actionButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButtonTextSecondary: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});