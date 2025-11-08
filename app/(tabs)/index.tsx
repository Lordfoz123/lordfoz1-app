import { useAuth } from '@/contexts/AuthContext';
import { useGPS } from '@/contexts/GPSContext';
import { useRealTimeLocation } from '@/hooks/useRealTimeLocation';
import { useRoutes } from '@/hooks/useRoutes';
import { useWorkSchedule } from '@/hooks/useWorkSchedule';
import { seedMonitoringRoutes } from '@/scripts/seedMonitoringRoutes';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, userData } = useAuth();
  const { routes, loading, error, refresh } = useRoutes();
  
  // ✅ HOOKS PARA TRACKING - CONTEXTO GPS LIMPIO
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    isLoading, 
    error: gpsError,
    lastUpdate,
    clearError,
    currentUserId
  } = useGPS();
  
  // 🛑 SOLUCIÓN DEL BUCLE: SOLO USAR LOCATION CUANDO TRACKING ESTÁ ACTIVO
  const { currentLocation } = useRealTimeLocation(isTracking ? 'cymperu' : null);
  
  const { workStatus, isInWorkHours, currentSchedule, timeUntilNextChange } = useWorkSchedule('cymperu');
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(Battery.BatteryState.UNKNOWN);

  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ✅ LIMPIAR ERRORES GPS AUTOMÁTICAMENTE
  useEffect(() => {
    if (gpsError) {
      console.error('GPS Error:', gpsError);
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [gpsError, clearError]);

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // 🔋 OBTENER NIVEL DE BATERÍA
  useEffect(() => {
    const getBatteryInfo = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        setBatteryLevel(Math.round(level * 100));
        setBatteryState(state);
      } catch (error) {
        console.error('Error al obtener info de batería:', error);
      }
    };

    getBatteryInfo();

    const batteryInterval = setInterval(getBatteryInfo, 30000);

    const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(Math.round(batteryLevel * 100));
    });

    const stateSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
      setBatteryState(batteryState);
    });

    return () => {
      clearInterval(batteryInterval);
      subscription.remove();
      stateSubscription.remove();
    };
  }, []);

  // 🎨 ANIMACIÓN DE PULSO MEJORADA
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
    
    if (isTracking) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
    
    return () => pulse.stop();
  }, [isTracking]);

  // Animaciones
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // ✅ FUNCIÓN PRINCIPAL - CONTROL GPS DIRECTO
  const handleTrackingToggle = async () => {
    if (isTracking) {
      await stopTracking();
    } else {
      const success = await startTracking();
      if (success) {
        setTimeout(() => {
          router.replace('/(tabs)');
          setTimeout(() => {
            router.push('/(tabs)/map');
          }, 200);
        }, 300);
      }
    }
  };

  const handleSeedRoutes = async () => {
    if (!user) return;

    Alert.alert(
      'Crear rutas de monitoreo',
      '¿Quieres crear 5 rutas de ejemplo con matrices de Aire, Agua, Suelo y Salud Ocupacional?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            try {
              const success = await seedMonitoringRoutes(user.uid);
              if (success) {
                Alert.alert(
                  'Éxito', 
                  'Se crearon 5 rutas de monitoreo:\n\n' +
                  '• Monitoreo Integral Zona Norte\n' +
                  '• Calidad de Aire - Lima Centro\n' +
                  '• Calidad de Agua - Costa Verde\n' +
                  '• Suelos - Zona Industrial\n' +
                  '• Salud Ocupacional'
                );
                refresh();
              } else {
                Alert.alert('Error', 'No se pudieron crear las rutas');
              }
            } catch (err) {
              console.error('Error al crear rutas:', err);
              Alert.alert('Error', 'No se pudieron crear las rutas');
            }
          },
        },
      ]
    );
  };

  // 🎨 LÓGICA DE ESTADO GPS
  const getWorkStatusInfo = () => {
    const isOvertime = isTracking && !isInWorkHours;
    
    if (isTracking) {
      if (isOvertime) {
        return {
          color: '#8B5CF6',
          status: 'GPS Activo',
          details: 'Horas extra • Tracking manual',
          icon: 'time'
        };
      }
      
      switch (workStatus) {
        case 'WORKING':
          return {
            color: '#10B981',
            status: 'GPS Activo',
            details: 'En horario laboral • Tracking automático',
            icon: 'checkmark-circle'
          };
        case 'BREAK':
          return {
            color: '#F59E0B',
            status: 'GPS Activo',
            details: 'En descanso • Tracking activo',
            icon: 'pause-circle'
          };
        case 'OVERTIME':
          return {
            color: '#8B5CF6',
            status: 'GPS Activo',
            details: 'Horas extra • Tracking manual',
            icon: 'time'
          };
        case 'OFF_DUTY':
        default:
          return {
            color: '#8B5CF6',
            status: 'GPS Activo',
            details: 'Fuera de horario • Tracking manual',
            icon: 'time'
          };
      }
    } else {
      switch (workStatus) {
        case 'WORKING':
          return {
            color: '#EF4444',
            status: 'GPS Inactivo',
            details: 'En horario laboral • Tocar para activar',
            icon: 'stop-circle'
          };
        case 'BREAK':
          return {
            color: '#F59E0B',
            status: 'En Descanso',
            details: 'Pausa laboral • GPS pausado',
            icon: 'pause-circle'
          };
        case 'OVERTIME':
          return {
            color: '#8B5CF6',
            status: 'Horas Extra',
            details: 'Fuera de horario • Activar manualmente',
            icon: 'time'
          };
        case 'OFF_DUTY':
        default:
          return {
            color: '#9CA3AF',
            status: 'Fuera de Servicio',
            details: 'Fuera de horario • Tocar para activar',
            icon: 'stop-circle'
          };
      }
    }
  };

  // Filtrar rutas
  const activeRoute = routes.find(r => r.status === 'in-progress');
  const pendingRoutes = routes.filter(r => r.status === 'pending');
  const completedToday = routes.filter(r => {
    if (r.status !== 'completed') return false;
    const today = new Date();
    const completedDate = new Date(r.updatedAt);
    return completedDate.toDateString() === today.toDateString();
  });

  // Estadísticas del día
  const todayStats = {
    points: completedToday.reduce((sum, r) => sum + r.completedPoints, 0),
    totalPoints: routes.filter(r => r.status !== 'completed').reduce((sum, r) => sum + r.totalPoints, 0) + 
                 completedToday.reduce((sum, r) => sum + r.totalPoints, 0),
    distance: completedToday.reduce((sum, r) => sum + r.totalDistance, 0).toFixed(1),
    time: completedToday.reduce((sum, r) => sum + r.estimatedTime, 0),
    completed: completedToday.length,
    pending: pendingRoutes.length,
    inProgress: activeRoute ? 1 : 0,
  };

  // Calcular progreso del día
  const dayProgress = todayStats.totalPoints > 0 
    ? Math.round((todayStats.points / todayStats.totalPoints) * 100) 
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'pending': return '#2196F3';
      default: return '#999';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  // Formatear fecha
  const formatDate = () => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const dayName = days[currentTime.getDay()];
    const day = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    
    return `${dayName}, ${day} ${month}`;
  };

  // Formatear hora para header (cada minuto)
  const formatTime = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 🔋 OBTENER ICONO DE BATERÍA SEGÚN NIVEL
  const getBatteryIcon = () => {
    if (batteryLevel === null) return 'battery-half-outline';
    
    if (batteryState === Battery.BatteryState.CHARGING) {
      return 'battery-charging';
    }
    
    if (batteryLevel >= 90) return 'battery-full';
    if (batteryLevel >= 60) return 'battery-half';
    if (batteryLevel >= 30) return 'battery-half';
    if (batteryLevel >= 10) return 'battery-dead';
    return 'battery-dead';
  };

  // 🔋 OBTENER COLOR DE BATERÍA SEGÚN NIVEL
  const getBatteryColor = () => {
    if (batteryLevel === null) return '#999';
    
    if (batteryState === Battery.BatteryState.CHARGING) {
      return '#4CAF50';
    }
    
    if (batteryLevel >= 50) return '#4CAF50';
    if (batteryLevel >= 20) return '#FF9800';
    return '#f44336';
  };

  const workStatusInfo = getWorkStatusInfo();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />

      {/* Header animado con blur */}
      <Animated.View style={[styles.headerWrapper, { opacity: headerOpacity }]}>
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.headerBlur, isDark && styles.headerBlurDark]}
        >
          <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, isDark && styles.textDark]}>Inicio</Text>
          </View>
        </BlurView>
      </Animated.View>

      {/* ✅ BANNER DE ERROR GPS SI EXISTE */}
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

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={isDark ? '#fff' : '#000'} />
        }
      >
        {/* Header con saludo y fecha/hora */}
        <Animated.View style={[styles.greetingSection, { opacity: greetingOpacity }]}>
          <View style={styles.greetingHeader}>
            <View style={styles.greetingLeft}>
              <Text style={[styles.greetingSmall, isDark && styles.textSecondaryDark]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.greeting, isDark && styles.textDark]}>
                Bienvenido, {userData?.displayName || userData?.name || 'Usuario'}
              </Text>
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeItem}>
                  <Ionicons name="calendar-outline" size={16} color={isDark ? '#999' : '#666'} />
                  <Text style={[styles.dateTimeText, isDark && styles.textSecondaryDark]}>
                    {formatDate()}
                  </Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <Ionicons name="time-outline" size={16} color={isDark ? '#999' : '#666'} />
                  <Text style={[styles.dateTimeText, isDark && styles.textSecondaryDark]}>
                    {formatTime()}
                  </Text>
                </View>
                {batteryLevel !== null && (
                  <View style={styles.dateTimeItem}>
                    <Ionicons 
                      name={getBatteryIcon()} 
                      size={16} 
                      color={getBatteryColor()} 
                    />
                    <Text style={[styles.dateTimeText, { color: getBatteryColor() }]}>
                      {batteryLevel}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ESTADO DEL SERVICIO - CONTROL PRINCIPAL DEL TRACKING */}
        <View style={styles.section}>
          <View style={[styles.serviceCard, isDark && styles.cardDark]}>
            <View style={styles.serviceHeader}>
              <Ionicons name="flash" size={24} color={workStatusInfo.color} />
              <Text style={[styles.serviceTitle, isDark && styles.textDark]}>
                Estado del Servicio
              </Text>
              {/* ✅ MOSTRAR LOADING DEL GPS SI EXISTE */}
              {isLoading && (
                <ActivityIndicator size="small" color={workStatusInfo.color} style={{ marginLeft: 8 }} />
              )}
            </View>

            {/* ✅ ÁREA GPS - AHORA ES BOTÓN DIRECTO */}
            <TouchableOpacity 
              style={styles.gpsContainer}
              onPress={handleTrackingToggle}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <View style={styles.gpsLeftSide}>
                <Animated.View style={[
                  styles.gpsPulse, 
                  { 
                    backgroundColor: `${workStatusInfo.color}20`,
                    transform: [{ scale: pulseAnim }]
                  }
                ]}>
                  <View style={[styles.gpsInner, { backgroundColor: `${workStatusInfo.color}40` }]}>
                    <View style={[styles.gpsDot, { backgroundColor: workStatusInfo.color }]}>
                      <Ionicons name={workStatusInfo.icon} size={12} color="white" />
                    </View>
                  </View>
                </Animated.View>
                <View style={styles.gpsTextContainer}>
                  <View style={styles.gpsStatusRow}>
                    <View style={[styles.gpsActiveDot, { backgroundColor: workStatusInfo.color }]} />
                    <Text style={[styles.gpsStatus, isDark && styles.textDark]}>
                      {workStatusInfo.status}
                    </Text>
                  </View>
                  <Text style={[styles.gpsDetails, isDark && styles.textSecondaryDark]}>
                    {workStatusInfo.details}
                  </Text>
                  {/* ✅ INFORMACIÓN MEJORADA DE UBICACIÓN Y SINCRONIZACIÓN */}
                  {isTracking && currentLocation && (
                    <Text style={[styles.gpsLocation, isDark && styles.textSecondaryDark]}>
                      📍 Ubicación: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </Text>
                  )}
                  {isTracking && lastUpdate && (
                    <Text style={[styles.gpsSync, isDark && styles.textSecondaryDark]}>
                      🔄 Sync: {Math.floor((Date.now() - lastUpdate) / 1000)}s ago • Usuario: {currentUserId}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* ✅ BOTÓN PRINCIPAL: GPS + REDIRECCIÓN DIRECTA - LOADING STATE */}
              <TouchableOpacity 
                style={[
                  styles.quickTrackingButton, 
                  { backgroundColor: workStatusInfo.color },
                  isLoading && { opacity: 0.6 }
                ]}
                onPress={handleTrackingToggle}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons 
                    name={isTracking ? "stop" : "play"} 
                    size={16} 
                    color="white" 
                  />
                )}
              </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.scheduleContainer}>
                <Ionicons name="time-outline" size={20} color={isDark ? '#999' : '#666'} />
                <Text style={[styles.scheduleText, isDark && styles.textSecondaryDark]}>
                  Horario: {currentSchedule?.startTime || '08:00'} - {currentSchedule?.endTime || '18:00'}
                </Text>
              </View>
              
              {batteryLevel !== null && (
                <View style={[styles.batteryContainer, isDark && styles.batteryContainerDark]}>
                  <Ionicons 
                    name={getBatteryIcon()} 
                    size={20} 
                    color={getBatteryColor()} 
                  />
                  <Text style={[styles.batteryText, { color: getBatteryColor() }]}>
                    {batteryLevel}%
                    {batteryState === Battery.BatteryState.CHARGING && ' ⚡'}
                  </Text>
                </View>
              )}
            </View>

            {timeUntilNextChange && (
              <View style={styles.timeInfo}>
                <Ionicons name="timer-outline" size={16} color={workStatusInfo.color} />
                <Text style={[styles.timeInfoText, { color: workStatusInfo.color }]}>
                  {timeUntilNextChange}
                </Text>
              </View>
            )}

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, isDark && styles.textSecondaryDark]}>
                  Progreso del Día
                </Text>
                <Text style={styles.progressPercentage}>
                  {dayProgress}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${dayProgress}%` }]} />
              </View>
              <Text style={[styles.progressDetails, isDark && styles.textSecondaryDark]}>
                {todayStats.points} de {todayStats.totalPoints} puntos completados
              </Text>
            </View>
          </View>
        </View>

        {/* Resto del componente igual... */}
        {/* Resumen rápido - 3 cards */}
        <View style={styles.section}>
          <View style={styles.quickSummary}>
            <View style={[styles.summaryCard, styles.summaryCardPending]}>
              <Ionicons name="ellipse-outline" size={32} color="#2196F3" />
              <Text style={styles.summaryNumber}>{todayStats.pending}</Text>
              <Text style={styles.summaryLabel}>Pendientes</Text>
            </View>

            <View style={[styles.summaryCard, styles.summaryCardProgress]}>
              <Ionicons name="navigate" size={32} color="#FF9800" />
              <Text style={styles.summaryNumber}>{todayStats.inProgress}</Text>
              <Text style={styles.summaryLabel}>Siguiente</Text>
            </View>

            <View style={[styles.summaryCard, styles.summaryCardCompleted]}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.summaryNumber}>{todayStats.completed}</Text>
              <Text style={styles.summaryLabel}>Completados</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas de distancia y tiempo */}
        <View style={styles.section}>
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, isDark && styles.cardDark]}>
              <Ionicons name="trending-up" size={28} color="#4CAF50" />
              <Text style={[styles.metricValue, isDark && styles.textDark]}>
                {todayStats.distance} km
              </Text>
              <Text style={[styles.metricLabel, isDark && styles.textSecondaryDark]}>
                Recorridos Hoy
              </Text>
            </View>

            <View style={[styles.metricCard, isDark && styles.cardDark]}>
              <Ionicons name="time" size={28} color="#4CAF50" />
              <Text style={[styles.metricValue, isDark && styles.textDark]}>
                {Math.floor(todayStats.time / 60)}h {todayStats.time % 60}min
              </Text>
              <Text style={[styles.metricLabel, isDark && styles.textSecondaryDark]}>
                Tiempo Activo
              </Text>
            </View>
          </View>
        </View>

        {/* Ruta Activa */}
        {activeRoute && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="navigate-circle" size={24} color="#FF9800" />
                <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginBottom: 0, marginLeft: 8 }]}>
                  Ruta Actual
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.activeRouteCard, isDark && styles.cardDark]}
              onPress={() => router.push(`/route-detail/${activeRoute.id}`)}
            >
              <View style={styles.activeRouteHeader}>
                <Text style={[styles.activeRouteTitle, isDark && styles.textDark]}>
                  {activeRoute.name}
                </Text>
                <View style={styles.priorityBadgeContainer}>
                  <Ionicons 
                    name={getPriorityIcon(activeRoute.priority)} 
                    size={16} 
                    color={getPriorityColor(activeRoute.priority)} 
                  />
                  <Text style={[styles.priorityBadgeText, { color: getPriorityColor(activeRoute.priority) }]}>
                    {activeRoute.priority === 'high' ? 'Alta' : activeRoute.priority === 'medium' ? 'Media' : 'Baja'}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(activeRoute.completedPoints / activeRoute.totalPoints) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, isDark && styles.textSecondaryDark]}>
                  {Math.round((activeRoute.completedPoints / activeRoute.totalPoints) * 100)}%
                </Text>
              </View>

              <View style={styles.routeMetrics}>
                <View style={styles.metricItem}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={[styles.metricText, isDark && styles.textSecondaryDark]}>
                    {activeRoute.completedPoints}/{activeRoute.totalPoints} puntos
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="speedometer" size={16} color="#666" />
                  <Text style={[styles.metricText, isDark && styles.textSecondaryDark]}>
                    {activeRoute.totalDistance} km
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => router.push(`/route-detail/${activeRoute.id}`)}
              >
                <Text style={styles.continueButtonText}>Continuar navegación</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {/* Rutas Pendientes */}
        {pendingRoutes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons name="time" size={24} color="#2196F3" />
                <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginBottom: 0, marginLeft: 8 }]}>
                  Pendientes Hoy ({pendingRoutes.length})
                </Text>
              </View>
            </View>

            {pendingRoutes.slice(0, 3).map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[styles.routeCard, isDark && styles.cardDark]}
                onPress={() => router.push(`/route-detail/${route.id}`)}
              >
                <View style={styles.routeCardHeader}>
                  <View style={styles.routeCardLeft}>
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(route.priority) }]} />
                    <Text style={[styles.routeCardTitle, isDark && styles.textDark]}>{route.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
                <View style={styles.routeCardMetrics}>
                  <View style={styles.metricItem}>
                    <Ionicons name="location-outline" size={14} color="#999" />
                    <Text style={[styles.metricTextSmall, isDark && styles.textSecondaryDark]}>
                      {route.totalPoints} puntos
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="navigate-outline" size={14} color="#999" />
                    <Text style={[styles.metricTextSmall, isDark && styles.textSecondaryDark]}>
                      {route.totalDistance} km
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="time-outline" size={14} color="#999" />
                    <Text style={[styles.metricTextSmall, isDark && styles.textSecondaryDark]}>
                      {route.estimatedTime} min
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {pendingRoutes.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/routes')}
              >
                <Text style={styles.viewAllText}>Ver todas las rutas pendientes</Text>
                <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty state */}
        {!loading && routes.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="flask-outline" size={64} color={isDark ? '#666' : '#ccc'} />
            </View>
            <Text style={[styles.emptyText, isDark && styles.textDark]}>
              No tienes rutas de monitoreo asignadas
            </Text>
            <Text style={[styles.emptySubtext, isDark && styles.textSecondaryDark]}>
              Crea rutas de monitoreo ambiental para comenzar
            </Text>
            <TouchableOpacity style={styles.seedButton} onPress={handleSeedRoutes}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.seedButtonText}>Crear rutas de monitoreo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
              Cargando rutas...
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ✅ ESTILOS IGUALES (sin cambios)
const styles = StyleSheet.create({
  // ... todos los estilos iguales que antes (sin cambios)
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBlur: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerBlurDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  
  // ✅ BANNER DE ERROR GPS
  errorBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 120,
    left: 16,
    right: 16,
    backgroundColor: '#f44336',
    borderRadius: 8,
    zIndex: 11,
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
  
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight || 40) + 60,
    paddingHorizontal: 16,
  },
  greetingSection: {
    marginBottom: 24,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingLeft: {
    flex: 1,
  },
  greetingSmall: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  gpsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  gpsLeftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gpsPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gpsInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gpsTextContainer: {
    flex: 1,
  },
  gpsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gpsActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  gpsStatus: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  gpsDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  gpsLocation: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gpsSync: {
    fontSize: 11,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  quickTrackingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleText: {
    fontSize: 15,
    color: '#666',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  batteryContainerDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  timeInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressDetails: {
    fontSize: 12,
    color: '#666',
  },
  quickSummary: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardPending: {
    backgroundColor: '#E3F2FD',
  },
  summaryCardProgress: {
    backgroundColor: '#FFF3E0',
  },
  summaryCardCompleted: {
    backgroundColor: '#E8F5E9',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  activeRouteCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activeRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeRouteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  priorityBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  routeMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 14,
    color: '#666',
  },
  metricTextSmall: {
    fontSize: 12,
    color: '#999',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  routeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  routeCardMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  seedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
});