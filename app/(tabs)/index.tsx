import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import GPSService from '../../services/GPSService';

export default function HomeScreen() {
  const { user, userName, userRole, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('#4CAF50');
    }
  }, []);

  useEffect(() => {
    checkGPSStatus();
  }, []);

  useEffect(() => {
    if (isTracking) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  const checkGPSStatus = async () => {
    const tracking = await GPSService.isTracking();
    setIsTracking(tracking);
    
    if (tracking) {
      const location = await GPSService.getCurrentLocation();
      setCurrentLocation(location);
    }
  };

  const handleStartTracking = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para usar el GPS');
        return;
      }

      await GPSService.startTracking(user.uid);
      setIsTracking(true);
      
      const interval = setInterval(async () => {
        const location = await GPSService.getCurrentLocation();
        setCurrentLocation(location);
      }, 5000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error al iniciar tracking:', error);
      Alert.alert('Error', 'No se pudo activar el GPS');
    }
  };

  const handleStopTracking = async () => {
    try {
      await GPSService.stopTracking();
      setIsTracking(false);
      setCurrentLocation(null);
    } catch (error) {
      console.error('Error al detener tracking:', error);
      Alert.alert('Error', 'No se pudo desactivar el GPS');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          },
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const displayName = userName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  // TODO: En el futuro, estos datos vendrán de Firestore
  const routes = [
    {
      id: 1,
      name: 'Ruta Centro',
      totalPoints: 6,
      completedPoints: 3,
      points: [
        { id: 1, status: 'completed' },
        { id: 2, status: 'completed' },
        { id: 3, status: 'completed' },
        { id: 4, status: 'current' },
        { id: 5, status: 'pending' },
        { id: 6, status: 'pending' },
      ],
    },
    {
      id: 2,
      name: 'Ruta Norte',
      totalPoints: 5,
      completedPoints: 2,
      points: [
        { id: 1, status: 'completed' },
        { id: 2, status: 'completed' },
        { id: 3, status: 'current' },
        { id: 4, status: 'pending' },
        { id: 5, status: 'pending' },
      ],
    },
  ];

  const getPointColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'current':
        return '#FFC107';
      case 'pending':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>Bienvenido, {displayName}</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.dateTimeContainer}>
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.dateTime}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short' 
              })}
            </Text>
            <Ionicons name="time-outline" size={16} color="#fff" style={{ marginLeft: 12 }} />
            <Text style={styles.dateTime}>
              {new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={24} color="#4CAF50" />
            <Text style={[styles.cardTitle, isDark && styles.textDark]}>
              Estado del Servicio
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, isDark && styles.statusIndicatorDark, isTracking && styles.statusIndicatorActive]}>
              <View style={[styles.statusDot, isTracking && styles.statusDotActive]} />
              {isTracking && (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.5],
                        outputRange: [0.5, 0],
                      }),
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.statusTextContainer}>
              <View style={styles.statusTitleRow}>
                {isTracking && <View style={styles.activeDot} />}
                <Text style={[styles.statusTitle, isDark && styles.textDark]}>
                  {isTracking ? 'GPS Activo' : 'GPS Inactivo'}
                </Text>
              </View>
              <Text style={[styles.statusSubtitle, isDark && styles.textSecondaryDark]}>
                {isTracking 
                  ? 'Precisión: Alta • Sincronizando' 
                  : 'Toca el botón para iniciar'
                }
              </Text>
            </View>
          </View>

          <View style={[styles.scheduleContainer, isDark && styles.borderDark]}>
            <Ionicons name="time-outline" size={20} color={isDark ? '#999' : '#666'} />
            <Text style={[styles.scheduleText, isDark && styles.textSecondaryDark]}>
              Horario Laboral: 08:00 - 18:00
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, isDark && styles.textSecondaryDark]}>
                Progreso del Día
              </Text>
              <Text style={styles.progressPercentage}>38%</Text>
            </View>
            <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
              <View style={[styles.progressFill, { width: '38%' }]} />
            </View>
            <Text style={[styles.progressSubtext, isDark && styles.textSecondaryDark]}>
              3 de 8 puntos completados
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="ellipse-outline" size={32} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>5</Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Pendientes</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="navigate" size={32} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>1</Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Siguiente</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>3</Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Completados</Text>
          </View>
        </View>

        <View style={[styles.distanceCard, isDark && styles.distanceCardDark]}>
          <View style={styles.distanceItem}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.distanceNumber}>8.5 km</Text>
            <Text style={[styles.distanceLabel, isDark && styles.textSecondaryDark]}>
              Recorridos Hoy
            </Text>
          </View>

          <View style={[styles.distanceDivider, isDark && styles.distanceDividerDark]} />

          <View style={styles.distanceItem}>
            <Ionicons name="time" size={24} color="#4CAF50" />
            <Text style={styles.distanceNumber}>2h 15min</Text>
            <Text style={[styles.distanceLabel, isDark && styles.textSecondaryDark]}>
              Tiempo Activo
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.trackingButton, isTracking && styles.trackingButtonActive]}
          onPress={isTracking ? handleStopTracking : handleStartTracking}
        >
          <Ionicons 
            name={isTracking ? 'stop-circle' : 'play-circle'} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.trackingButtonText}>
            {isTracking ? 'Detener Monitoreo' : 'Iniciar Monitoreo'}
          </Text>
        </TouchableOpacity>

        <View style={[styles.routesSection]}>
          <View style={styles.routesHeader}>
            <Ionicons name="location" size={24} color="#4CAF50" />
            <Text style={[styles.routesTitle, isDark && styles.textDark]}>Rutas de Hoy</Text>
          </View>

          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[styles.routeCard, isDark && styles.routeCardDark]}
              onPress={() => {
                Alert.alert('Ruta', `Navegando a ${route.name}`);
              }}
            >
              <View style={styles.routeInfo}>
                <Text style={[styles.routeName, isDark && styles.textDark]}>
                  {route.name}
                </Text>
                
                <View style={styles.routeProgress}>
                  {route.points.map((point) => (
                    <View
                      key={point.id}
                      style={[
                        styles.routePoint,
                        { backgroundColor: getPointColor(point.status) }
                      ]}
                    />
                  ))}
                </View>
                
                <Text style={[styles.routeSubtext, isDark && styles.textSecondaryDark]}>
                  {route.completedPoints} de {route.totalPoints} puntos completados
                </Text>
              </View>

              <Ionicons name="navigate" size={24} color="#4CAF50" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#E8F5E9',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateTime: {
    fontSize: 14,
    color: '#E8F5E9',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
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
    marginLeft: 8,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  statusIndicatorDark: {
    backgroundColor: '#2a2a2a',
  },
  statusIndicatorActive: {
    backgroundColor: '#E8F5E9',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#999',
    zIndex: 2,
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  pulseRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    zIndex: 1,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 12,
  },
  borderDark: {
    borderTopColor: '#333',
  },
  scheduleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarDark: {
    backgroundColor: '#333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statCardBlue: {
    backgroundColor: '#E3F2FD',
  },
  statCardOrange: {
    backgroundColor: '#FFF3E0',
  },
  statCardGreen: {
    backgroundColor: '#E8F5E9',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  distanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceCardDark: {
    backgroundColor: '#1e1e1e',
  },
  distanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  distanceNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
    marginBottom: 4,
  },
  distanceLabel: {
    fontSize: 12,
    color: '#666',
  },
  distanceDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  distanceDividerDark: {
    backgroundColor: '#333',
  },
  trackingButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trackingButtonActive: {
    backgroundColor: '#f44336',
    shadowColor: '#f44336',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  routesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  routesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  routeCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeCardDark: {
    backgroundColor: '#1e1e1e',
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  routeProgress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  routePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeSubtext: {
    fontSize: 12,
    color: '#666',
  },
});