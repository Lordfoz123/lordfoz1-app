import { getAllMatrices } from '@/constants/monitoring';
import { MonitoringPoint } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { RoutePreview } from './RoutePreview';

// TIPOS PARA ÍCONOS
type IoniconsName = 
  | "filter" 
  | "infinite" 
  | "text" 
  | "map" 
  | "push" 
  | "at" 
  | "checkmark-circle" 
  | "pause-circle" 
  | "time" 
  | "stop-circle" 
  | "water" 
  | "key" 
  | "camera" 
  | "search" 
  | "repeat" 
  | "link"
  | "locate"
  | "information-circle-outline"
  | "layers"
  | "checkmark"
  | "close"
  | "chevron-down"
  | "grid";

interface MonitoringMapProps {
  points: MonitoringPoint[];
  currentLocation?: { latitude: number; longitude: number } | null;
  isTracking?: boolean;
  workStatus?: string;
  isInWorkHours?: boolean;
  showRoute?: boolean;
  showLegend?: boolean;
  showGPSControls?: boolean;
  onPointPress?: (point: MonitoringPoint) => void;
  shouldCenterOnUser?: boolean;
  selectedMatrix?: string | null;
  // ✅ NUEVAS PROPS PARA CENTRADO ESPECÍFICO
  centerCoordinates?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
}

export default function MonitoringMap({
  points,
  currentLocation,
  isTracking = false,
  workStatus = 'WORKING',
  isInWorkHours = true,
  showRoute = false,
  showLegend = false,
  showGPSControls = true,
  onPointPress,
  shouldCenterOnUser = false,
  selectedMatrix = null,
  centerCoordinates = null,
}: MonitoringMapProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // 🕘 ESTADOS PARA PÍLDORA DE HORA
  const [isTimeSheetVisible, setIsTimeSheetVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // ℹ️ ESTADOS PARA LEYENDA SHEET
  const [isLegendSheetVisible, setIsLegendSheetVisible] = useState(false);
  
  // ✅ ESTADOS PARA NAVEGACIÓN
  const [showNavigation, setShowNavigation] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MonitoringPoint | null>(null);
  
  // REFERENCIAS
  const mapRef = useRef<MapView>(null);
  
  // 🎬 ANIMACIONES PARA SHEETS (INCLUYENDO ROUTE PREVIEW)
  const timeSheetAnimation = useRef(new Animated.Value(320)).current;
  const timeOverlayOpacity = useRef(new Animated.Value(0)).current;
  const legendSheetAnimation = useRef(new Animated.Value(500)).current;
  const legendOverlayOpacity = useRef(new Animated.Value(0)).current;
  // ✅ NUEVAS ANIMACIONES PARA ROUTE PREVIEW
  const routeSheetAnimation = useRef(new Animated.Value(300)).current;
  const routeOverlayOpacity = useRef(new Animated.Value(0)).current;

  // ✅ REF PARA CONTROLAR CENTRADO Y EVITAR SPAM
  const lastCenterRef = useRef<string>('');

  // 🕘 ACTUALIZAR HORA CADA SEGUNDO
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ CENTRAR EN COORDENADAS ESPECÍFICAS (ZOOM CERCANO) - SIN SPAM
  useEffect(() => {
    if (centerCoordinates && mapRef.current) {
      const centerKey = `${centerCoordinates.latitude}-${centerCoordinates.longitude}-${centerCoordinates.latitudeDelta}`;
      
      // Solo centrar si las coordenadas cambiaron
      if (centerKey !== lastCenterRef.current) {
        lastCenterRef.current = centerKey;
        
        // Solo log en desarrollo y cuando realmente se centra
        if (__DEV__) {
          console.log('🎯 Centrando en coordenadas específicas:', centerCoordinates.latitude, centerCoordinates.longitude);
        }
        
        mapRef.current.animateToRegion({
          latitude: centerCoordinates.latitude,
          longitude: centerCoordinates.longitude,
          latitudeDelta: centerCoordinates.latitudeDelta,
          longitudeDelta: centerCoordinates.longitudeDelta,
        }, 1500);
      }
    }
  }, [centerCoordinates]);

  // CENTRAR EN USUARIO CUANDO SE SOLICITE (SIN COORDENADAS ESPECÍFICAS)
  useEffect(() => {
    if (shouldCenterOnUser && currentLocation && mapRef.current && !centerCoordinates) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [shouldCenterOnUser, currentLocation, centerCoordinates]);

  // 🎯 CENTRAR CUANDO CAMBIA MATRIZ SELECCIONADA - INCLUYENDO "TODAS"
  useEffect(() => {
    if (points.length > 0 && mapRef.current && !centerCoordinates) {
      centerOnSelectedMatrix();
    }
  }, [selectedMatrix, points, centerCoordinates]);

  // ✅ MANEJAR PRESIÓN DE PUNTO - CON ANIMACIONES NATIVAS
  const handlePointPress = (point: MonitoringPoint) => {
    if (currentLocation) {
      setSelectedPoint(point);
      setShowNavigation(true);
      
      // ✅ ANIMACIÓN NATIVA AL ABRIR (IGUAL QUE EL RELOJ)
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
    }
  };

  // ✅ CERRAR NAVEGACIÓN CON ANIMACIONES NATIVAS
  const closeNavigation = () => {
    // ✅ ANIMACIÓN NATIVA AL CERRAR (IGUAL QUE EL RELOJ)
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
      setShowNavigation(false);
      setSelectedPoint(null);
    });
  };

  // ✅ IR AL ROUTE DETAIL DESDE EL SHEET
  const goToRouteDetail = () => {
    if (selectedPoint) {
      closeNavigation(); // Cerrar sheet primero
      onPointPress?.(selectedPoint); // Luego ir al route detail
    }
  };

  // 🎨 OBTENER COLOR SEGÚN ESTADO DEL GPS - MISMA LÓGICA QUE INDEX
  const getWorkStatusColor = () => {
    if (!isTracking) return '#9CA3AF';
    
    const isOvertime = isTracking && !isInWorkHours;
    
    if (isOvertime) {
      return '#8B5CF6';
    }
    
    switch (workStatus) {
      case 'WORKING': return '#10B981';
      case 'BREAK': return '#F59E0B';
      case 'OVERTIME': return '#8B5CF6';
      case 'OFF_DUTY': return '#8B5CF6';
      default: return '#10B981';
    }
  };

  // 🎨 OBTENER DESCRIPCIÓN CORRECTA DEL ESTADO - MISMA LÓGICA QUE INDEX
  const getStatusDescription = () => {
    if (!isTracking) return 'GPS Inactivo';
    
    const isOvertime = isTracking && !isInWorkHours;
    
    if (isOvertime) {
      return 'Horas Extra';
    }
    
    switch (workStatus) {
      case 'WORKING': return 'Horario Laboral';
      case 'BREAK': return 'En Descanso';
      case 'OVERTIME': return 'Horas Extra';
      case 'OFF_DUTY': return 'Horas Extra';
      default: return 'GPS Activo';
    }
  };

  // 🎨 OBTENER ÍCONO SEGÚN ESTADO - MISMA LÓGICA QUE INDEX
  const getWorkStatusIcon = (): IoniconsName => {
    if (!isTracking) return 'stop-circle';
    
    const isOvertime = isTracking && !isInWorkHours;
    
    if (isOvertime) {
      return 'time';
    }
    
    switch (workStatus) {
      case 'WORKING': return 'checkmark-circle';
      case 'BREAK': return 'pause-circle';
      case 'OVERTIME': return 'time';
      case 'OFF_DUTY': return 'time';
      default: return 'checkmark-circle';
    }
  };

  // 📝 TEXTO CORTO DEL ESTADO - MISMA LÓGICA QUE INDEX
  const getWorkStatusShortText = () => {
    if (!isTracking) return 'GPS Off';
    
    const isOvertime = isTracking && !isInWorkHours;
    
    if (isOvertime) {
      return 'Horas Extra';
    }
    
    switch (workStatus) {
      case 'WORKING': return 'Trabajando';
      case 'BREAK': return 'Descanso';
      case 'OVERTIME': return 'Horas Extra';
      case 'OFF_DUTY': return 'Horas Extra';
      default: return 'Activo';
    }
  };

  // ⏱️ CALCULAR HORAS TRABAJADAS
  const getWorkedHours = () => {
    if (!isTracking) return '0:00h';
    
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(8, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(18, 0, 0, 0);
    
    let totalMinutes = 0;
    const isOvertime = isTracking && !isInWorkHours;
    
    if (isOvertime) {
      if (now > endOfDay) {
        totalMinutes = Math.floor((now.getTime() - endOfDay.getTime()) / (1000 * 60));
      } else if (now < startOfDay) {
        const earlyStart = new Date(now);
        earlyStart.setHours(6, 0, 0, 0);
        if (now >= earlyStart) {
          totalMinutes = Math.floor((startOfDay.getTime() - now.getTime()) / (1000 * 60));
        }
      }
    } else {
      if (workStatus === 'WORKING' && now >= startOfDay && now <= endOfDay) {
        totalMinutes = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60));
      } else if (workStatus === 'BREAK' && now >= startOfDay && now <= endOfDay) {
        totalMinutes = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60));
      }
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}h`;
  };

  // 📊 OBTENER ESTADÍSTICAS DETALLADAS DE TRABAJO
  const getWorkStats = () => {
    if (!isTracking) {
      return {
        normalHours: '0:00h',
        extraHours: '0:00h',
        breakTime: '0:00h',
        totalHours: '0:00h'
      };
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(8, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(18, 0, 0, 0);

    const isOvertime = isTracking && !isInWorkHours;
    
    let normalMinutes = 0;
    let extraMinutes = 0;
    
    if (isOvertime) {
      if (now > endOfDay) {
        extraMinutes = Math.floor((now.getTime() - endOfDay.getTime()) / (1000 * 60));
      }
    } else if (workStatus === 'WORKING' && now >= startOfDay && now <= endOfDay) {
      normalMinutes = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60));
    }
    
    const breakMinutes = 30;

    const formatMinutes = (mins: number) => {
      const h = Math.floor(Math.abs(mins) / 60);
      const m = Math.abs(mins) % 60;
      return `${h}:${m.toString().padStart(2, '0')}h`;
    };

    return {
      normalHours: formatMinutes(Math.max(0, normalMinutes)),
      extraHours: formatMinutes(Math.max(0, extraMinutes)),
      breakTime: formatMinutes(breakMinutes),
      totalHours: formatMinutes(Math.max(0, normalMinutes) + Math.max(0, extraMinutes))
    };
  };

  // OBTENER CONFIGURACIÓN DE MATRIZ
  const getMatrixConfig = (matrixId: string) => {
    const matrices = getAllMatrices();
    return matrices.find(m => m.id === matrixId) || matrices[0];
  };

  // 🎯 CENTRAR EN MATRIZ SELECCIONADA - MEJORADO PARA "TODAS"
  const centerOnSelectedMatrix = () => {
    if (!mapRef.current || points.length === 0) return;

    const filteredPoints = selectedMatrix === null 
      ? points
      : points.filter(p => p.matrix === selectedMatrix);

    if (filteredPoints.length === 0) return;

    if (filteredPoints.length === 1) {
      mapRef.current.animateToRegion({
        latitude: filteredPoints[0].location.latitude,
        longitude: filteredPoints[0].location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    } else {
      const lats = filteredPoints.map(p => p.location.latitude);
      const lngs = filteredPoints.map(p => p.location.longitude);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const deltaLat = (maxLat - minLat) * 1.4;
      const deltaLng = (maxLng - minLng) * 1.4;

      mapRef.current.animateToRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(deltaLat, 0.02),
        longitudeDelta: Math.max(deltaLng, 0.02),
      }, 1000);
    }
  };

  // ✅ REGIÓN INICIAL DEL MAPA - PRIORIZAR COORDENADAS ESPECÍFICAS SIN LOGS
  const getInitialRegion = (): Region => {
    // SI HAY COORDENADAS ESPECÍFICAS, USAR ESAS
    if (centerCoordinates) {
      return {
        latitude: centerCoordinates.latitude,
        longitude: centerCoordinates.longitude,
        latitudeDelta: centerCoordinates.latitudeDelta,
        longitudeDelta: centerCoordinates.longitudeDelta,
      };
    }

    // SI NO HAY PUNTOS, LIMA POR DEFECTO
    if (points.length === 0) {
      return {
        latitude: -12.0464,
        longitude: -77.0428,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // CALCULAR REGIÓN PARA MOSTRAR TODOS LOS PUNTOS
    const lats = points.map(p => p.location.latitude);
    const lngs = points.map(p => p.location.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2;
    const deltaLng = (maxLng - minLng) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  // 🕘 FUNCIONES PARA PÍLDORA DE HORA
  const openTimeSheet = () => {
    setIsTimeSheetVisible(true);
    
    Animated.parallel([
      Animated.spring(timeSheetAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(timeOverlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeTimeSheet = () => {
    Animated.parallel([
      Animated.spring(timeSheetAnimation, {
        toValue: 320,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(timeOverlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsTimeSheetVisible(false));
  };

  // ℹ️ FUNCIONES PARA LEYENDA SHEET
  const openLegendSheet = () => {
    setIsLegendSheetVisible(true);
    
    Animated.parallel([
      Animated.spring(legendSheetAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(legendOverlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeLegendSheet = () => {
    Animated.parallel([
      Animated.spring(legendSheetAnimation, {
        toValue: 500,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(legendOverlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsLegendSheetVisible(false));
  };

  // CENTRAR EN UBICACIÓN ACTUAL - SIN LOGS SPAM
  const centerOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      // SI NO HAY UBICACIÓN, CENTRAR EN LIMA
      mapRef.current?.animateToRegion({
        latitude: -12.0464,
        longitude: -77.0428,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 1000);
    }
  };

  // 🕘 FORMATEAR HORA
  const formatLiveTime = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = () => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const dayName = days[currentTime.getDay()];
    const day = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    
    return `${dayName}, ${day} ${month}`;
  };

  const matrices = getAllMatrices();

  // ℹ️ DATOS DE ESTADO GPS PARA LEYENDA
  const statusLegendData = [
    {
      color: '#10B981',
      icon: 'checkmark-circle' as IoniconsName,
      title: 'Horario Laboral',
      description: 'GPS activo durante horas de trabajo'
    },
    {
      color: '#F59E0B',
      icon: 'pause-circle' as IoniconsName,
      title: 'En Descanso',
      description: 'GPS activo durante pausas laborales'
    },
    {
      color: '#8B5CF6',
      icon: 'time' as IoniconsName,
      title: 'Horas Extra',
      description: 'GPS activo fuera del horario normal'
    },
    {
      color: '#9CA3AF',
      icon: 'stop-circle' as IoniconsName,
      title: 'GPS Inactivo',
      description: 'Sin seguimiento de ubicación'
    }
  ];

  const workStats = getWorkStats();

  return (
    <View style={styles.container}>
      {/* ✅ GOOGLE MAPS CON REGIÓN DINÁMICA */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        customMapStyle={isDark ? darkMapStyle : undefined}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        showsPointsOfInterest={true}
      >
        {/* MARCADORES DE PUNTOS DE MONITOREO */}
        {points && points.length > 0 && points.map((point, index) => {
          if (!point || !point.location) return null;
          
          const config = getMatrixConfig(point.matrix);
          return (
            <Marker
              key={`point-${index}-${point.id || index}`}
              coordinate={{
                latitude: point.location.latitude,
                longitude: point.location.longitude,
              }}
              onPress={() => handlePointPress(point)}
            >
              <View style={styles.bigPinMarker}>
                {/* SOMBRA */}
                <View style={styles.bigPinShadow} />
                
                {/* CABEZA DEL PIN */}
                <View style={[styles.bigPinHead, { backgroundColor: config.color }]}>
                  <Ionicons name={config.icon as IoniconsName} size={16} color="#fff" />
                  {point.status === 'completed' && (
                    <View style={styles.bigPinCheck}>
                      <Ionicons name="checkmark" size={8} color="#fff" />
                    </View>
                  )}
                </View>

                {/* PUNTA DEL PIN */}
                <View style={[styles.bigPinTip, { borderTopColor: config.color }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ✅ NAVEGACIÓN CON ANIMACIONES NATIVAS COMO EL RELOJ */}
      {showNavigation && selectedPoint && currentLocation && (
        <>
          {/* OVERLAY OPACO ANIMADO */}
          <Animated.View
            style={[
              styles.overlay, 
              { opacity: routeOverlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeNavigation} />
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
                latitude: selectedPoint.location.latitude,
                longitude: selectedPoint.location.longitude,
              }}
              destinationName={selectedPoint.name}
              onClose={closeNavigation}
              onShowDetails={goToRouteDetail}
            />
          </Animated.View>
        </>
      )}

      {/* 💼 PÍLDORA DE ESTADO GPS CON CONTADOR DE HORAS */}
      <TouchableOpacity 
        style={[styles.statusPill, isDark && styles.statusPillDark]}
        onPress={openTimeSheet}
        activeOpacity={0.8}
      >
        <View style={[styles.statusIconCircle, { backgroundColor: getWorkStatusColor() }]}>
          <Ionicons name={getWorkStatusIcon()} size={16} color="#fff" />
        </View>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
            {getWorkStatusShortText()}
          </Text>
          <Text style={[styles.hoursText, { color: getWorkStatusColor() }]}>
            {getWorkedHours()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* CONTROLES GPS */}
      {showGPSControls && (
        <View style={styles.controlsContainer}>
          {/* 🎯 BOTÓN DE CENTRAR GPS */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={centerOnUser}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="locate" 
              size={24} 
              color={isTracking ? "#4CAF50" : "#999"}
            />
          </TouchableOpacity>

          {/* ℹ️ BOTÓN DE LEYENDA */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={openLegendSheet}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* 🕘 SHEET DE ESTADÍSTICAS DE TRABAJO */}
      {isTimeSheetVisible && (
        <>
          <Animated.View
            style={[
              styles.overlay, 
              { opacity: timeOverlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }) }
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeTimeSheet} />
          </Animated.View>

          <Animated.View 
            style={[
              styles.timeSheet, 
              isDark && styles.timeSheetDark,
              { transform: [{ translateY: timeSheetAnimation }] }
            ]}
          >
            <TouchableOpacity style={styles.sheetHandle} onPress={closeTimeSheet}>
              <View style={[styles.handle, isDark && styles.handleDark]} />
            </TouchableOpacity>

            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <View style={[styles.statusIconLarge, { backgroundColor: getWorkStatusColor() }]}>
                  <Ionicons name={getWorkStatusIcon()} size={28} color="#fff" />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={[styles.sheetTitle, isDark && styles.textDark]}>
                    {getStatusDescription()}
                  </Text>
                  <Text style={[styles.sheetSubtitle, isDark && styles.textSecondaryDark]}>
                    {formatLiveTime()} • {formatDate()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.workTimeDisplay}>
                <Text style={[styles.mainHours, { color: getWorkStatusColor() }]}>
                  {getWorkedHours()}
                </Text>
                <Text style={[styles.hoursLabel, isDark && styles.textSecondaryDark]}>
                  {(!isInWorkHours && isTracking) || workStatus === 'OVERTIME' || workStatus === 'OFF_DUTY' ? 'Horas Extra' : 'Horas Trabajadas Hoy'}
                </Text>
                
                {/* ESTADÍSTICAS DETALLADAS */}
                <View style={styles.statsGrid}>
                  <View style={[styles.statItem, isDark && styles.statItemDark]}>
                    <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Normales</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{workStats.normalHours}</Text>
                  </View>
                  <View style={[styles.statItem, isDark && styles.statItemDark]}>
                    <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Extra</Text>
                    <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{workStats.extraHours}</Text>
                  </View>
                  <View style={[styles.statItem, isDark && styles.statItemDark]}>
                    <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Descanso</Text>
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>{workStats.breakTime}</Text>
                  </View>
                </View>
                
                <View style={[styles.totalContainer, { backgroundColor: `${getWorkStatusColor()}20` }]}>
                  <Text style={[styles.totalLabel, { color: getWorkStatusColor() }]}>Total Trabajado</Text>
                  <Text style={[styles.totalValue, { color: getWorkStatusColor() }]}>{workStats.totalHours}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.sheetButton, { backgroundColor: getWorkStatusColor() }]}
                onPress={closeTimeSheet}
              >
                <Text style={styles.sheetButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}

      {/* ℹ️ SHEET DE LEYENDA */}
      {isLegendSheetVisible && (
        <>
          <Animated.View
            style={[
              styles.overlay, 
              { opacity: legendOverlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }) }
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeLegendSheet} />
          </Animated.View>

          <Animated.View 
            style={[
              styles.legendSheet, 
              isDark && styles.legendSheetDark,
              { transform: [{ translateY: legendSheetAnimation }] }
            ]}
          >
            <TouchableOpacity style={styles.sheetHandle} onPress={closeLegendSheet}>
              <View style={[styles.handle, isDark && styles.handleDark]} />
            </TouchableOpacity>

            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <Ionicons name="layers" size={24} color="#4CAF50" />
                <Text style={[styles.sheetTitle, isDark && styles.textDark]}>Información del Mapa</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
                {/* MATRICES DE MONITOREO */}
                <View style={styles.legendSection}>
                  <Text style={[styles.legendSectionTitle, isDark && styles.textDark]}>
                    Tipos de Matriz
                  </Text>
                  {matrices.map((config, idx) => (
                    <View key={`matrix-${idx}`} style={styles.legendItem}>
                      <View style={[styles.legendIcon, { 
                        backgroundColor: config.color,
                        borderColor: '#fff',
                      }]}>
                        <Ionicons name={config.icon as IoniconsName} size={16} color="#fff" />
                      </View>
                      <View style={styles.legendItemText}>
                        <Text style={[styles.legendItemTitle, isDark && styles.textDark]}>
                          {config.name}
                        </Text>
                        <Text style={[styles.legendItemDescription, isDark && styles.textSecondaryDark]}>
                          {config.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* ESTADOS GPS */}
                <View style={styles.legendSection}>
                  <Text style={[styles.legendSectionTitle, isDark && styles.textDark]}>
                    Estados GPS
                  </Text>
                  {statusLegendData.map((status, idx) => (
                    <View key={`status-${idx}`} style={styles.legendItem}>
                      <View style={[styles.legendIcon, { 
                        backgroundColor: status.color,
                        borderColor: '#fff',
                      }]}>
                        <Ionicons name={status.icon} size={16} color="#fff" />
                      </View>
                      <View style={styles.legendItemText}>
                        <Text style={[styles.legendItemTitle, isDark && styles.textDark]}>
                          {status.title}
                        </Text>
                        <Text style={[styles.legendItemDescription, isDark && styles.textSecondaryDark]}>
                          {status.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>

              <TouchableOpacity 
                style={[styles.sheetButton, { backgroundColor: '#4CAF50' }]}
                onPress={closeLegendSheet}
              >
                <Text style={styles.sheetButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

// ESTILO OSCURO MEJORADO PARA EL MAPA
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#1a1a1a"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#1a1a1a"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#8a8a8a"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#2c2c2c"}]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#9e9e9e"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#0f1419"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#515c6d"}]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  
  // MARCADORES DE PUNTOS DE MONITOREO
  bigPinMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 44,
  },
  bigPinShadow: {
    position: 'absolute',
    bottom: 1,
    width: 14,
    height: 4,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bigPinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: 'transparent',
  },
  bigPinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -3,
    elevation: 3,
  },
  bigPinCheck: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  // PÍLDORA DE ESTADO GPS
  statusPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 160,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 6,
    shadowColor: 'transparent',
    gap: 10,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minWidth: 140,
  },
  statusPillDark: {
    backgroundColor: '#2c2c2e',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statusTextDark: {
    color: '#fff',
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // CONTROLES - Z-INDEX REDUCIDO
  controlsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 40,
    right: 16,
    flexDirection: 'column',
    gap: 12,
    zIndex: 3, // ✅ REDUCIDO PARA NO TAPAR SHEETS
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: 'transparent',
  },

  // ✅ NUEVO ESTILO PARA ROUTE SHEET CONTAINER
  routeSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
  },

  // SHEETS Y OVERLAYS
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 15,
  },
  timeSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 450,
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
  timeSheetDark: {
    backgroundColor: '#1c1c1e',
  },
  legendSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 500,
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
  legendSheetDark: {
    backgroundColor: '#1c1c1e',
  },
  sheetHandle: {
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
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statusIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workTimeDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainHours: {
    fontSize: 56,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  hoursLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statItemDark: {
    backgroundColor: '#2c2c2e',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sheetButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  sheetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // LEYENDA
  legendSection: {
    marginBottom: 24,
  },
  legendSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  legendIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: 'transparent',
  },
  legendItemText: {
    flex: 1,
  },
  legendItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  legendItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
});