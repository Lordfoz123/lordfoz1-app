import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { CreateEventModal } from './CreateEventModal';

const { width: screenWidth } = Dimensions.get('window');

interface MonitoringEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  technician: string;
  matrix: 'aire' | 'agua' | 'suelo' | 'ruido';
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  isOvertime?: boolean;
}

type MatrixFilter = 'all' | 'aire' | 'agua' | 'suelo' | 'ruido';

export default function CalendarView() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 5)); // 5 Nov 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 5));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState<MatrixFilter>('all');

  // ✅ ANIMACIONES PARA GESTOS
  const translateX = useRef(new Animated.Value(0)).current;
  const gestureThreshold = 50; // Distancia mínima para activar el gesto

  const mockEvents: MonitoringEvent[] = [
    // NOVIEMBRE 2025 - DATOS CORRECTOS
    {
      id: '1',
      title: 'Calidad de Aire - Centro',
      date: '2025-11-05',
      startTime: '08:00',
      endTime: '10:30',
      technician: 'Carlos Mendoza',
      matrix: 'aire',
      priority: 'high',
      status: 'scheduled',
      location: 'Plaza de Armas, Lima'
    },
    {
      id: '2',
      title: 'Monitoreo de Agua',
      date: '2025-11-05',
      startTime: '14:00',
      endTime: '16:00',
      technician: 'Ana García',
      matrix: 'agua',
      priority: 'medium',
      status: 'in-progress',
      location: 'Río Rímac'
    },
    // SÁBADOS NOVIEMBRE: 1, 8, 15, 22, 29
    {
      id: '3',
      title: 'Análisis de Suelo',
      date: '2025-11-01', // SÁBADO
      startTime: '09:00',
      endTime: '13:00',
      technician: 'Carlos Mendoza',
      matrix: 'suelo',
      priority: 'medium',
      status: 'scheduled',
      location: 'San Isidro'
    },
    {
      id: '4',
      title: 'Medición de Ruido',
      date: '2025-11-08', // SÁBADO
      startTime: '10:00',
      endTime: '12:00',
      technician: 'Ana García',
      matrix: 'ruido',
      priority: 'low',
      status: 'scheduled',
      location: 'Miraflores'
    },
    {
      id: '5',
      title: 'Calidad de Aire - Surco',
      date: '2025-11-15', // SÁBADO
      startTime: '08:00',
      endTime: '14:00',
      technician: 'Luis Torres',
      matrix: 'aire',
      priority: 'high',
      status: 'scheduled',
      location: 'Surco'
    },
    // Más eventos para la semana actual
    {
      id: '6',
      title: 'Monitoreo de Agua - Río',
      date: '2025-11-03', // LUNES
      startTime: '07:00',
      endTime: '12:00',
      technician: 'Luis Torres',
      matrix: 'agua',
      priority: 'high',
      status: 'scheduled',
      location: 'Río Rímac'
    },
    {
      id: '7',
      title: 'Análisis de Suelo Industrial',
      date: '2025-11-04', // MARTES
      startTime: '06:00',
      endTime: '14:00',
      technician: 'María López',
      matrix: 'suelo',
      priority: 'high',
      status: 'scheduled',
      location: 'Zona Industrial'
    },
    {
      id: '8',
      title: 'Ruido Ambiental',
      date: '2025-11-06', // JUEVES
      startTime: '15:00',
      endTime: '18:00',
      technician: 'Carlos Mendoza',
      matrix: 'ruido',
      priority: 'medium',
      status: 'scheduled',
      location: 'Centro de Lima'
    },
    {
      id: '9',
      title: 'Calidad de Aire - Mañana',
      date: '2025-11-07', // VIERNES
      startTime: '06:30',
      endTime: '11:30',
      technician: 'Ana García',
      matrix: 'aire',
      priority: 'high',
      status: 'scheduled',
      location: 'San Borja'
    }
  ];

  // ✅ CONFIGURACIÓN DE MATRICES ESTILO APPLE
  const matrixConfig = {
    aire: { 
      color: '#007AFF', 
      darkColor: '#0A84FF',
      icon: 'cloud-outline', 
      label: 'Aire' 
    },
    agua: { 
      color: '#32D74B', 
      darkColor: '#30D158',
      icon: 'water-outline', 
      label: 'Agua' 
    },
    suelo: { 
      color: '#8E4EC6', 
      darkColor: '#BF5AF2',
      icon: 'earth-outline', 
      label: 'Suelo' 
    },
    ruido: { 
      color: '#FF9500', 
      darkColor: '#FF9F0A',
      icon: 'volume-high-outline', 
      label: 'Ruido' 
    }
  };

  // ✅ FUNCIONES DE UTILIDAD
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // ✅ ORDEN ESTÁNDAR (como Google Calendar, iOS)
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesShort = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return formatDateString(date1) === formatDateString(date2);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDate(date, today);
  };

  const isSunday = (date: Date): boolean => {
    return date.getDay() === 0;
  };

  const isSaturday = (date: Date): boolean => {
    return date.getDay() === 6;
  };

  // ✅ GENERAR DÍAS DE LA SEMANA ACTUAL
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Restar para llegar al domingo
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  // ✅ FUNCIÓN COMPLETAMENTE REDISEÑADA
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    console.log(`🗓️ GENERANDO CALENDARIO PARA: ${monthNames[month]} ${year}`);
    
    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay(); // 0 = domingo, 6 = sábado
    
    // Último día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    console.log(`📅 Primer día: ${firstDayOfMonth.toDateString()} (día semana: ${startDay})`);
    console.log(`📅 Días en el mes: ${daysInMonth}`);
    
    const calendarDays: Date[] = [];
    
    // ✅ DÍAS DEL MES ANTERIOR (para llenar la primera semana)
    for (let i = startDay - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month - 1, new Date(year, month, 0).getDate() - i);
      calendarDays.push(prevMonthDay);
      console.log(`⬅️ Mes anterior: ${prevMonthDay.getDate()}/${prevMonthDay.getMonth() + 1} (${prevMonthDay.toDateString()})`);
    }
    
    // ✅ DÍAS DEL MES ACTUAL
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      calendarDays.push(currentDay);
      
      if (currentDay.getDay() === 6) { // Es sábado
        console.log(`🔵 SÁBADO: ${day}/${month + 1} en posición ${calendarDays.length - 1}`);
      }
      if (currentDay.getDay() === 0) { // Es domingo
        console.log(`🟣 DOMINGO: ${day}/${month + 1} en posición ${calendarDays.length - 1}`);
      }
    }
    
    // ✅ DÍAS DEL MES SIGUIENTE (para completar 6 semanas)
    const totalDays = calendarDays.length;
    const remainingDays = 42 - totalDays; // 6 semanas × 7 días = 42
    
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      calendarDays.push(nextMonthDay);
      console.log(`➡️ Mes siguiente: ${nextMonthDay.getDate()}/${nextMonthDay.getMonth() + 1} (${nextMonthDay.toDateString()})`);
    }
    
    console.log(`📊 TOTAL DÍAS GENERADOS: ${calendarDays.length}`);
    
    return calendarDays;
  };

  // ✅ NAVEGACIÓN DE MESES/SEMANAS
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // ✅ CONFIGURACIÓN DE GESTOS CON PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Solo activar si el movimiento es principalmente horizontal
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Limitar el movimiento para que no sea excesivo
        const limitedDx = Math.max(-100, Math.min(100, gestureState.dx));
        translateX.setValue(limitedDx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();
        
        // Determinar dirección y activar navegación
        if (Math.abs(gestureState.dx) > gestureThreshold) {
          if (gestureState.dx > 0) {
            // Swipe derecha = mes/semana anterior
            goToPrevious();
          } else {
            // Swipe izquierda = mes/semana siguiente
            goToNext();
          }
        }
        
        // Resetear animación
        Animated.spring(translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // ✅ FUNCIONES DE EVENTOS
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      case 'scheduled': return 'calendar-outline';
      case 'cancelled': return 'close-circle';
      default: return 'calendar-outline';
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateString(date);
    let events = mockEvents.filter(event => event.date === dateStr);
    
    // Aplicar filtro de matriz
    if (matrixFilter !== 'all') {
      events = events.filter(event => event.matrix === matrixFilter);
    }
    
    return events;
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  // ✅ GENERAR HORAS PARA VISTA SEMANAL MEJORADA
  const generateHours = () => {
    const hours = [];
    // Mostrar solo horario laboral relevante (6 AM - 10 PM)
    for (let i = 6; i <= 22; i++) {
      const hour12 = i > 12 ? i - 12 : i === 0 ? 12 : i;
      const ampm = i >= 12 ? 'p. m.' : 'a. m.';
      
      if (i === 12) {
        hours.push({ hour24: i, display: 'Mediodía', short: '12 PM' });
      } else {
        hours.push({ 
          hour24: i, 
          display: `${hour12} ${ampm}`,
          short: `${hour12}${ampm === 'a. m.' ? 'AM' : 'PM'}`
        });
      }
    }
    return hours;
  };

  // ✅ CALCULAR POSICIÓN Y ALTURA DE EVENTOS
  const calculateEventLayout = (event: MonitoringEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinutes = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinutes = parseInt(event.endTime.split(':')[1]);
    
    const startPosition = ((startHour - 6) * 60 + startMinutes); // Offset desde 6 AM
    const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes);
    
    return {
      top: startPosition,
      height: Math.max(duration, 30), // Mínimo 30 minutos de altura
      duration: duration
    };
  };

  const calendarDays = generateCalendarDays();
  const weekDays = generateWeekDays();
  const selectedDateEvents = getEventsForDate(selectedDate);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const hours = generateHours();

  // ✅ CALCULAR ANCHO EXACTO DE CELDA
  const containerPadding = 32; // 16 * 2
  const gridPadding = 16; // 8 * 2
  const availableWidth = screenWidth - containerPadding - gridPadding;
  const cellWidth = Math.floor(availableWidth / 7);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* HEADER ESTILO APPLE */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
        
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={goToPrevious} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#007AFF' : '#007AFF'} />
          </TouchableOpacity>
          
          <Text style={[styles.monthYear, isDark && styles.monthYearDark]}>
            {viewMode === 'month' 
              ? `${monthNames[currentMonth]} ${currentYear}`
              : `${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`
            }
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="search-outline" size={22} color={isDark ? '#8E8E93' : '#8E8E93'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={openCreateModal}>
              <Ionicons name="add" size={22} color={isDark ? '#007AFF' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* SUBTITLE SOLO EN VISTA MES */}
        {viewMode === 'month' && (
          <View style={styles.subtitleContainer}>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {mockEvents.filter(e => e.status === 'scheduled').length} monitoreos programados
            </Text>
          </View>
        )}
      </View>

      {/* CONTROLES DE VISTA Y FILTROS ESTILO APPLE */}
      <View style={[styles.controlsContainer, isDark && styles.controlsContainerDark]}>
        {/* SELECTOR DE VISTA */}
        <View style={styles.viewControls}>
          <View style={[styles.viewSelector, isDark && styles.viewSelectorDark]}>
            <TouchableOpacity
              style={[
                styles.viewOption,
                viewMode === 'month' && styles.viewOptionActive,
                viewMode === 'month' && (isDark ? styles.viewOptionActiveDark : styles.viewOptionActiveLight)
              ]}
              onPress={() => setViewMode('month')}
            >
              <Text style={[
                styles.viewOptionText,
                isDark && styles.viewOptionTextDark,
                viewMode === 'month' && styles.viewOptionTextActive
              ]}>
                Mes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewOption,
                viewMode === 'week' && styles.viewOptionActive,
                viewMode === 'week' && (isDark ? styles.viewOptionActiveDark : styles.viewOptionActiveLight)
              ]}
              onPress={() => setViewMode('week')}
            >
              <Text style={[
                styles.viewOptionText,
                isDark && styles.viewOptionTextDark,
                viewMode === 'week' && styles.viewOptionTextActive
              ]}>
                Semana
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.todayButton, isDark && styles.todayButtonDark]} onPress={goToToday}>
            <Text style={[styles.todayButtonText, isDark && styles.todayButtonTextDark]}>Hoy</Text>
          </TouchableOpacity>
        </View>

        {/* FILTROS DE MATRIZ ESTILO APPLE */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              isDark && styles.filterChipDark,
              matrixFilter === 'all' && styles.filterChipActive,
              matrixFilter === 'all' && (isDark ? styles.filterChipActiveDark : styles.filterChipActiveLight)
            ]}
            onPress={() => setMatrixFilter('all')}
          >
            <Ionicons 
              name="apps" 
              size={16} 
              color={matrixFilter === 'all' ? '#FFFFFF' : (isDark ? '#8E8E93' : '#8E8E93')} 
            />
            <Text style={[
              styles.filterChipText,
              isDark && styles.filterChipTextDark,
              matrixFilter === 'all' && styles.filterChipTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>

          {Object.entries(matrixConfig).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterChip,
                isDark && styles.filterChipDark,
                matrixFilter === key && styles.filterChipActive,
                matrixFilter === key && { backgroundColor: isDark ? config.darkColor : config.color }
              ]}
              onPress={() => setMatrixFilter(key as MatrixFilter)}
            >
              <Ionicons 
                name={config.icon as any} 
                size={16} 
                color={matrixFilter === key ? '#FFFFFF' : (isDark ? config.darkColor : config.color)} 
              />
              <Text style={[
                styles.filterChipText,
                matrixFilter === key && styles.filterChipTextActive,
                matrixFilter !== key && { color: isDark ? config.darkColor : config.color }
              ]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CONTENIDO CON GESTOS ACTIVADOS */}
      <Animated.View 
        style={[
          styles.content, 
          { 
            transform: [{ translateX }],
            opacity: translateX.interpolate({
              inputRange: [-100, 0, 100],
              outputRange: [0.7, 1, 0.7],
              extrapolate: 'clamp',
            })
          }
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {viewMode === 'month' ? (
            <>
              {/* DÍAS DE LA SEMANA */}
              <View style={styles.weekDays}>
                {dayNames.map((day) => (
                  <View key={day} style={{ width: cellWidth }}>
                    <Text style={[
                      styles.weekDay, 
                      isDark && styles.weekDayDark,
                      day === 'Dom' && (isDark ? styles.weekDaySundayDark : styles.weekDaySunday),
                      day === 'Sáb' && (isDark ? styles.weekDaySaturdayDark : styles.weekDaySaturday)
                    ]}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* GRID DE DÍAS CON SOLO COLORES EN NÚMEROS */}
              <View style={[styles.daysGrid, isDark && styles.daysGridDark]}>
                {calendarDays.map((date, index) => {
                  const dayOfMonth = date.getDate();
                  const isCurrentMonth = date.getMonth() === currentMonth;
                  const isSelected = isSameDate(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const dayEvents = getEventsForDate(date);
                  
                  // ✅ DETERMINAR SI ES SÁBADO O DOMINGO BASADO EN getDay()
                  const isSaturdayDay = date.getDay() === 6;
                  const isSundayDay = date.getDay() === 0;

                  return (
                    <TouchableOpacity
                      key={`day-${index}-${dayOfMonth}-${date.getMonth()}-${date.getFullYear()}`}
                      style={[
                        styles.dayCell,
                        { width: cellWidth },
                        isSelected && (isDark ? styles.selectedDayDark : styles.selectedDay),
                      ]}
                      onPress={() => setSelectedDate(new Date(date))}
                    >
                      <View style={[
                        styles.dayNumberContainer,
                        isTodayDate && (isDark ? styles.todayCircleDark : styles.todayCircle)
                      ]}>
                        <Text style={[
                          styles.dayNumber,
                          isDark && styles.dayNumberDark,
                          isSelected && styles.selectedDayText,
                          isTodayDate && styles.todayDayText,
                          // ✅ SOLO COLORES EN TEXTO - SIN CUADROS
                          isSaturdayDay && isCurrentMonth && (isDark ? styles.saturdayDayTextDark : styles.saturdayDayText),
                          isSundayDay && isCurrentMonth && (isDark ? styles.sundayDayTextDark : styles.sundayDayText),
                          !isCurrentMonth && styles.otherMonthText,
                        ]}>
                          {dayOfMonth}
                        </Text>
                      </View>

                      {/* EVENTOS */}
                      {hasEvents(date) && (
                        <View style={styles.eventIndicators}>
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <View
                              key={`${event.id}-${idx}`}
                              style={[
                                styles.eventDot,
                                { backgroundColor: isDark ? matrixConfig[event.matrix].darkColor : matrixConfig[event.matrix].color }
                              ]}
                            />
                          ))}
                        </View>
                      )}
                      
                      {/* INDICADOR DOMINGO SIN EVENTOS */}
                      {isSundayDay && isCurrentMonth && !hasEvents(date) && (
                        <View style={styles.sundayIndicator}>
                          <Ionicons name="time-outline" size={10} color={isDark ? "#BF5AF2" : "#8E4EC6"} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            /* ✅ VISTA DE SEMANA MEJORADA ESTILO APPLE */
            <View style={[styles.weekContainer, isDark && styles.weekContainerDark]}>
              {/* ENCABEZADOS DE DÍAS */}
              <View style={[styles.weekHeader, isDark && styles.weekHeaderDark]}>
                <View style={styles.timeColumnHeader} />
                {weekDays.map((date, index) => {
                  const isTodayDate = isToday(date);
                  const isSelectedDate = isSameDate(date, selectedDate);
                  const isSaturdayDay = date.getDay() === 6;
                  const isSundayDay = date.getDay() === 0;
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.dayColumnHeader}
                      onPress={() => setSelectedDate(new Date(date))}
                    >
                      <Text style={[
                        styles.weekDayLabel,
                        isDark && styles.weekDayLabelDark,
                        isSundayDay && (isDark ? styles.weekDaySundayDark : styles.weekDaySunday),
                        isSaturdayDay && (isDark ? styles.weekDaySaturdayDark : styles.weekDaySaturday)
                      ]}>
                        {dayNamesShort[date.getDay()]}
                      </Text>
                      <View style={[
                        styles.weekDayNumber,
                        isTodayDate && (isDark ? styles.todayCircleDark : styles.todayCircle),
                        isSelectedDate && !isTodayDate && (isDark ? styles.selectedCircleDark : styles.selectedCircle)
                      ]}>
                        <Text style={[
                          styles.weekDayNumberText,
                          isDark && styles.weekDayNumberTextDark,
                          (isTodayDate || isSelectedDate) && styles.weekDayNumberTextActive
                        ]}>
                          {date.getDate()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* GRILLA DE HORAS CON EVENTOS POSICIONADOS */}
              <ScrollView style={styles.weekGrid} showsVerticalScrollIndicator={false}>
                <View style={styles.weekContent}>
                  {/* LÍNEAS DE TIEMPO */}
                  <View style={styles.timeLinesContainer}>
                    {hours.map((timeSlot, hourIndex) => (
                      <View key={timeSlot.hour24} style={[styles.timeSlot, isDark && styles.timeSlotDark]}>
                        <View style={styles.timeColumn}>
                          <Text style={[styles.hourLabel, isDark && styles.hourLabelDark]}>
                            {timeSlot.short}
                          </Text>
                        </View>
                        <View style={[styles.timeLine, isDark && styles.timeLineDark]} />
                      </View>
                    ))}
                  </View>

                  {/* EVENTOS POSICIONADOS ABSOLUTAMENTE */}
                  <View style={styles.eventsContainer}>
                    {weekDays.map((date, dayIndex) => {
                      const dayEvents = getEventsForDate(date);
                      const dayWidth = (screenWidth - 32 - 60) / 7; // Ancho disponible dividido por 7 días
                      
                      return (
                        <View 
                          key={dayIndex} 
                          style={[
                            styles.dayEventsColumn,
                            { 
                              left: 60 + (dayIndex * dayWidth),
                              width: dayWidth - 2
                            }
                          ]}
                        >
                          {dayEvents.map((event) => {
                            const layout = calculateEventLayout(event);
                            
                            return (
                              <TouchableOpacity
                                key={event.id}
                                style={[
                                  styles.weekEventCard,
                                  {
                                    top: layout.top,
                                    height: layout.height,
                                    backgroundColor: isDark 
                                      ? matrixConfig[event.matrix].darkColor 
                                      : matrixConfig[event.matrix].color,
                                  }
                                ]}
                              >
                                <Text style={styles.weekEventCardTitle} numberOfLines={2}>
                                  {event.title}
                                </Text>
                                <Text style={styles.weekEventCardTime}>
                                  {event.startTime} - {event.endTime}
                                </Text>
                                <Text style={styles.weekEventCardLocation} numberOfLines={1}>
                                  📍 {event.location}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>

                  {/* LÍNEA DE TIEMPO ACTUAL */}
                  {weekDays.some(date => isToday(date)) && (
                    <View style={[styles.currentTimeLine, isDark && styles.currentTimeLineDark]}>
                      <View style={[styles.currentTimeDot, isDark && styles.currentTimeDotDark]} />
                      <View style={[styles.currentTimeLineBar, isDark && styles.currentTimeLineBarDark]} />
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {/* EVENTOS DEL DÍA SELECCIONADO (solo en vista mes) */}
          {viewMode === 'month' && (
            <View style={[styles.dayEvents, isDark && styles.dayEventsDark]}>
              <View style={styles.dayEventsHeader}>
                <Text style={[styles.dayEventsTitle, isDark && styles.dayEventsTitleDark]}>
                  {isSameDate(selectedDate, new Date()) ? 'Hoy' : 
                   `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`}
                </Text>
                <View style={styles.eventStats}>
                  <Text style={[styles.eventCount, isDark && styles.eventCountDark]}>
                    {selectedDateEvents.length} eventos
                  </Text>
                  {isSunday(selectedDate) && (
                    <View style={[styles.overtimeBadge, isDark && styles.overtimeBadgeDark]}>
                      <Ionicons name="time" size={12} color={isDark ? "#BF5AF2" : "#8E4EC6"} />
                      <Text style={[styles.overtimeBadgeText, isDark && styles.overtimeBadgeTextDark]}>Domingo</Text>
                    </View>
                  )}
                  {isSaturday(selectedDate) && (
                    <View style={[styles.saturdayBadge, isDark && styles.saturdayBadgeDark]}>
                      <Ionicons name="calendar" size={12} color={isDark ? "#0A84FF" : "#007AFF"} />
                      <Text style={[styles.saturdayBadgeText, isDark && styles.saturdayBadgeTextDark]}>Sábado</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventCard, 
                      isDark && styles.eventCardDark,
                      event.isOvertime && styles.overtimeEventCard
                    ]}
                  >
                    <View style={[
                      styles.priorityBar,
                      { backgroundColor: isDark ? matrixConfig[event.matrix].darkColor : matrixConfig[event.matrix].color }
                    ]} />
                    
                    <View style={styles.eventContent}>
                      <View style={styles.eventHeader}>
                        <Text style={[styles.eventTitle, isDark && styles.eventTitleDark]}>
                          {event.title}
                        </Text>
                        <View style={styles.eventIcons}>
                          <Ionicons
                            name={matrixConfig[event.matrix].icon as any}
                            size={16}
                            color={isDark ? matrixConfig[event.matrix].darkColor : matrixConfig[event.matrix].color}
                          />
                          {event.isOvertime && (
                            <Ionicons name="time" size={14} color={isDark ? "#BF5AF2" : "#8E4EC6"} />
                          )}
                        </View>
                      </View>
                      
                      <Text style={[styles.eventTime, isDark && styles.eventTimeDark]}>
                        ⏰ {event.startTime} - {event.endTime}
                        {event.isOvertime && (
                          <Text style={[styles.overtimeLabel, isDark && styles.overtimeLabelDark]}> • Horas Extra</Text>
                        )}
                      </Text>
                      
                      <Text style={[styles.eventTechnician, isDark && styles.eventTechnicianDark]}>
                        👤 {event.technician}
                      </Text>
                      
                      <Text style={[styles.eventLocation, isDark && styles.eventLocationDark]}>
                        📍 {event.location}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noEvents}>
                  <Ionicons name="calendar-outline" size={48} color={isDark ? '#48484A' : '#C7C7CC'} />
                  <Text style={[styles.noEventsText, isDark && styles.noEventsTextDark]}>
                    No hay eventos programados
                  </Text>
                  {matrixFilter !== 'all' && (
                    <Text style={[styles.noEventsSubtext, isDark && styles.noEventsSubtextDark]}>
                      Filtro activo: {matrixConfig[matrixFilter as keyof typeof matrixConfig]?.label}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <CreateEventModal
        isVisible={showCreateModal}
        onClose={closeCreateModal}
        selectedDate={selectedDate}
        isDark={isDark}
      />
    </View>
  );
}

// ✅ Los estilos permanecen exactamente iguales
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  
  // ✅ HEADER ESTILO APPLE
  header: {
    backgroundColor: '#F2F2F7',
    paddingBottom: 8,
  },
  headerDark: {
    backgroundColor: '#000000',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    textAlign: 'left',
    marginLeft: 16,
  },
  monthYearDark: {
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitleContainer: {
    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  subtitleDark: {
    color: '#8E8E93',
  },

  // ✅ CONTROLES ESTILO APPLE
  controlsContainer: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  controlsContainerDark: {
    backgroundColor: '#000000',
  },
  
  viewControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 2,
  },
  viewSelectorDark: {
    backgroundColor: '#1C1C1E',
  },
  
  viewOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  viewOptionActive: {
    backgroundColor: '#FFFFFF',
  },
  viewOptionActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  viewOptionActiveDark: {
    backgroundColor: '#2C2C2E',
  },
  
  viewOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  viewOptionTextDark: {
    color: '#FFFFFF',
  },
  viewOptionTextActive: {
    color: '#000000',
  },
  
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  todayButtonDark: {
    backgroundColor: '#0A84FF',
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  todayButtonTextDark: {
    color: '#FFFFFF',
  },

  // ✅ FILTROS ESTILO APPLE
  filtersRow: {
    flexDirection: 'row',
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
    gap: 6,
  },
  filterChipDark: {
    backgroundColor: '#1C1C1E',
  },
  filterChipActive: {
    backgroundColor: '#34C759',
  },
  filterChipActiveLight: {
    backgroundColor: '#34C759',
  },
  filterChipActiveDark: {
    backgroundColor: '#30D158',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterChipTextDark: {
    color: '#8E8E93',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // ✅ VISTA DE MES
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    paddingVertical: 8,
  },
  weekDayDark: {
    color: '#8E8E93',
  },
  weekDaySunday: {
    color: '#8E4EC6',
    fontWeight: '700',
  },
  weekDaySundayDark: {
    color: '#BF5AF2',
    fontWeight: '700',
  },
  weekDaySaturday: {
    color: '#007AFF',
    fontWeight: '700',
  },
  weekDaySaturdayDark: {
    color: '#0A84FF',
    fontWeight: '700',
  },
  
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  daysGridDark: {
    backgroundColor: '#1C1C1E',
  },
  
  dayCell: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  
  dayNumberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  
  todayCircle: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
  },
  todayCircleDark: {
    backgroundColor: '#FF453A',
    borderRadius: 16,
  },
  
  selectedDay: {
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
  },
  selectedDayDark: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  
  dayNumberDark: {
    color: '#FFFFFF',
  },
  
  selectedDayText: {
    color: '#000000',
    fontWeight: '700',
  },
  
  todayDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  
  sundayDayText: {
    color: '#8E4EC6',
    fontWeight: '700',
  },
  sundayDayTextDark: {
    color: '#BF5AF2',
    fontWeight: '700',
  },
  
  saturdayDayText: {
    color: '#007AFF',
    fontWeight: '700',
  },
  saturdayDayTextDark: {
    color: '#0A84FF',
    fontWeight: '700',
  },
  
  otherMonthText: {
    color: '#C7C7CC',
  },
  
  eventIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 2,
    alignItems: 'center',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sundayIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(142, 78, 198, 0.2)',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ✅ VISTA DE SEMANA MEJORADA ESTILO APPLE
  weekContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekContainerDark: {
    backgroundColor: '#1C1C1E',
  },

  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
    paddingVertical: 12,
  },
  weekHeaderDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },

  timeColumnHeader: {
    width: 60,
  },

  dayColumnHeader: {
    flex: 1,
    alignItems: 'center',
  },

  weekDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  weekDayLabelDark: {
    color: '#8E8E93',
  },

  weekDayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedCircle: {
    backgroundColor: '#E5E5EA',
  },
  selectedCircleDark: {
    backgroundColor: '#2C2C2E',
  },

  weekDayNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  weekDayNumberTextDark: {
    color: '#FFFFFF',
  },
  weekDayNumberTextActive: {
    color: '#FFFFFF',
  },

  weekGrid: {
    flex: 1,
  },

  // ✅ NUEVA ESTRUCTURA PARA VISTA DE SEMANA
  weekContent: {
    position: 'relative',
    height: 16 * 60, // 16 horas × 60 minutos
  },

  timeLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  timeSlot: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F2',
  },
  timeSlotDark: {
    borderBottomColor: '#38383A',
  },

  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },

  hourLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  hourLabelDark: {
    color: '#8E8E93',
  },

  timeLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#F2F2F2',
    marginTop: 8,
  },
  timeLineDark: {
    backgroundColor: '#38383A',
  },

  eventsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  dayEventsColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },

  // ✅ EVENTOS EN VISTA SEMANAL MEJORADOS
  weekEventCard: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 6,
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  weekEventCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  weekEventCardTime: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },

  weekEventCardLocation: {
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.8,
  },

  // ✅ LÍNEA DE TIEMPO ACTUAL MEJORADA
  currentTimeLine: {
    position: 'absolute',
    top: 300, // Posición aproximada de 11:00 AM
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  currentTimeLineDark: {},
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginLeft: 54,
    marginRight: 6,
  },
  currentTimeDotDark: {
    backgroundColor: '#FF453A',
  },
  currentTimeLineBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#FF3B30',
    marginRight: 16,
  },
  currentTimeLineBarDark: {
    backgroundColor: '#FF453A',
  },

  // ✅ EVENTOS DEL DÍA SELECCIONADO (VISTA MES)
  dayEvents: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayEventsDark: {
    backgroundColor: '#1C1C1E',
  },
  dayEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayEventsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  dayEventsTitleDark: {
    color: '#FFFFFF',
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventCount: {
    fontSize: 15,
    color: '#8E8E93',
  },
  eventCountDark: {
    color: '#8E8E93',
  },
  
  overtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 78, 198, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  overtimeBadgeDark: {
    backgroundColor: 'rgba(191, 90, 242, 0.2)',
  },
  overtimeBadgeText: {
    fontSize: 11,
    color: '#8E4EC6',
    fontWeight: '600',
  },
  overtimeBadgeTextDark: {
    color: '#BF5AF2',
  },
  
  saturdayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  saturdayBadgeDark: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  saturdayBadgeText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  saturdayBadgeTextDark: {
    color: '#0A84FF',
  },
  
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  eventCardDark: {
    backgroundColor: '#2C2C2E',
  },
  overtimeEventCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#8E4EC6',
  },
  
  priorityBar: {
    width: 4,
  },
  
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  eventTitleDark: {
    color: '#FFFFFF',
  },
  eventIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  eventTimeDark: {
    color: '#8E8E93',
  },
  overtimeLabel: {
    color: '#8E4EC6',
    fontWeight: '600',
  },
  overtimeLabelDark: {
    color: '#BF5AF2',
  },
  eventTechnician: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  eventTechnicianDark: {
    color: '#8E8E93',
  },
  eventLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventLocationDark: {
    color: '#8E8E93',
  },
  
  noEvents: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#C7C7CC',
    marginTop: 12,
    textAlign: 'center',
  },
  noEventsTextDark: {
    color: '#48484A',
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noEventsSubtextDark: {
    color: '#8E8E93',
  },
});