import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
// ✅ AGREGAR ESTE IMPORT
import { Picker } from '@react-native-picker/picker';
import { CreateEventModal } from './CreateEventModal';

// ✅ IMPORTAR FIRESTORE Y HOOK
import { MonitoringEvent } from '../firebase';
import { useEvents } from '../hooks/useEvents';

const { width: screenWidth } = Dimensions.get('window');

type MatrixFilter = 'all' | 'aire' | 'agua' | 'suelo' | 'ruido';

export default function CalendarView() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // ✅ USAR DATOS REALES DE FIRESTORE
  const { events: firestoreEvents, loading, error, createEvent } = useEvents();
  
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState<MatrixFilter>('all');
  
  // ✅ NUEVOS ESTADOS
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth());
  const [visibleYear, setVisibleYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());
  const [pickerYear, setPickerYear] = useState(today.getFullYear());

  const weekScrollRef = useRef<ScrollView>(null);
  const daysScrollRef = useRef<ScrollView>(null);

  // ✅ COLORES DEL TEMA (mismo que el menú inferior)
  const THEME_COLOR = '#4CAF50'; // Verde como el ícono del calendario
  const THEME_COLOR_DARK = '#4CAF50';

  // ✅ DATOS MOCK COMO FALLBACK (solo si no hay conexión)
  const mockEventsFallback: MonitoringEvent[] = [
    {
      id: '1',
      title: 'Calidad de Aire - Centro',
      date: '2025-11-05',
      startTime: '08:00',
      endTime: '10:30',
      technician: 'Carlos Mendoza',
      matrix: 'aire',
      priority: 'high',
      status: 'completed',
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
      status: 'completed',
      location: 'Río Rímac'
    },
    {
      id: '10',
      title: 'Monitoreo de Calidad de Agua - Urgente',
      date: '2025-11-19',
      startTime: '09:00',
      endTime: '12:00',
      technician: 'María López',
      matrix: 'agua',
      priority: 'high',
      status: 'in-progress',
      location: 'Río Chillón'
    },
    {
      id: '11',
      title: 'Inspección de Ruido Industrial',
      date: '2025-11-19',
      startTime: '14:00',
      endTime: '17:00',
      technician: 'Carlos Mendoza',
      matrix: 'ruido',
      priority: 'medium',
      status: 'scheduled',
      location: 'Zona Industrial Ate'
    },
    {
      id: '12',
      title: 'Análisis de Suelo Agrícola',
      date: '2025-11-20',
      startTime: '07:00',
      endTime: '13:00',
      technician: 'Luis Torres',
      matrix: 'suelo',
      priority: 'high',
      status: 'scheduled',
      location: 'Valle de Lurín'
    },
    {
      id: '13',
      title: 'Medición de Calidad de Aire',
      date: '2025-11-20',
      startTime: '15:00',
      endTime: '18:00',
      technician: 'Ana García',
      matrix: 'aire',
      priority: 'medium',
      status: 'scheduled',
      location: 'San Juan de Lurigancho'
    },
    {
      id: '14',
      title: 'Monitoreo Integral - Agua y Suelo',
      date: '2025-11-21',
      startTime: '08:00',
      endTime: '16:00',
      technician: 'María López',
      matrix: 'agua',
      priority: 'high',
      status: 'scheduled',
      location: 'Planta Tratamiento La Chira'
    },
    {
      id: '15',
      title: 'Evaluación de Ruido Ambiental',
      date: '2025-11-22',
      startTime: '09:00',
      endTime: '14:00',
      technician: 'Carlos Mendoza',
      matrix: 'ruido',
      priority: 'medium',
      status: 'scheduled',
      location: 'Centro Comercial Jockey Plaza',
      isOvertime: true
    },
    {
      id: '16',
      title: 'Calidad de Aire - Weekend',
      date: '2025-11-22',
      startTime: '10:00',
      endTime: '13:00',
      technician: 'Ana García',
      matrix: 'aire',
      priority: 'low',
      status: 'scheduled',
      location: 'Parque Kennedy',
      isOvertime: true
    },
    {
      id: '17',
      title: 'Monitoreo Especial - Domingo',
      date: '2025-11-23',
      startTime: '08:00',
      endTime: '12:00',
      technician: 'Luis Torres',
      matrix: 'agua',
      priority: 'high',
      status: 'scheduled',
      location: 'Playa Costa Verde',
      isOvertime: true
    },
    {
      id: '18',
      title: 'Análisis de Suelo Contaminado',
      date: '2025-11-25',
      startTime: '06:00',
      endTime: '14:00',
      technician: 'María López',
      matrix: 'suelo',
      priority: 'high',
      status: 'scheduled',
      location: 'Exzona Industrial Callao'
    },
    {
      id: '19',
      title: 'Medición de Calidad de Aire - PM2.5',
      date: '2025-11-26',
      startTime: '07:00',
      endTime: '11:00',
      technician: 'Ana García',
      matrix: 'aire',
      priority: 'high',
      status: 'scheduled',
      location: 'Av. Abancay - Centro Lima'
    },
    {
      id: '20',
      title: 'Evaluación Acústica Nocturna',
      date: '2025-11-26',
      startTime: '20:00',
      endTime: '23:00',
      technician: 'Carlos Mendoza',
      matrix: 'ruido',
      priority: 'medium',
      status: 'scheduled',
      location: 'Barranco - Zona Turística'
    },
    {
      id: '21',
      title: 'Monitoreo de Agua Potable',
      date: '2025-11-27',
      startTime: '09:00',
      endTime: '15:00',
      technician: 'Luis Torres',
      matrix: 'agua',
      priority: 'high',
      status: 'scheduled',
      location: 'Planta Huachipa'
    },
  ];

  // ✅ USAR EVENTOS REALES O FALLBACK
  const mockEvents = firestoreEvents.length > 0 ? firestoreEvents : mockEventsFallback;

  // ✅ FUNCIÓN PARA CREAR EVENTO REAL
  const handleCreateEvent = async (eventData: Omit<MonitoringEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createEvent(eventData);
      setShowCreateModal(false);
      console.log('✅ Evento creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      // Aquí puedes agregar una alerta o toast para mostrar el error
    }
  };

  // ✅ MOSTRAR LOADING INICIAL
  if (loading && firestoreEvents.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 18 }}>🔄 Cargando eventos...</Text>
        <Text style={{ color: isDark ? '#8E8E93' : '#8E8E93', fontSize: 14, marginTop: 8 }}>
          Conectando con la base de datos
        </Text>
      </View>
    );
  }

  // ✅ MOSTRAR ERROR SI HAY PROBLEMA
  if (error && firestoreEvents.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FF0000', fontSize: 18, textAlign: 'center' }}>❌ Error de conexión</Text>
        <Text style={{ color: isDark ? '#8E8E93' : '#8E8E93', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
          {error}
        </Text>
        <Text style={{ color: isDark ? '#8E8E93' : '#8E8E93', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          Usando datos de demostración
        </Text>
      </View>
    );
  }

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

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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

  // ✅ FUNCIÓN PARA CREAR EVENTO DE PRUEBA (TEMPORAL)
  const createTestEvent = async () => {
    try {
      const testEvent = {
        title: 'Evento de Prueba - ' + new Date().toLocaleTimeString(),
        date: formatDateString(selectedDate),
        startTime: '09:00',
        endTime: '11:00',
        technician: 'Usuario Prueba',
        matrix: 'agua' as const,
        priority: 'high' as const,
        status: 'scheduled' as const,
        location: 'Lima Centro - Prueba'
      };
      
      await handleCreateEvent(testEvent);
      console.log('✅ Evento de prueba creado');
    } catch (error) {
      console.error('❌ Error creando evento de prueba:', error);
    }
  };

  // ✅ SINCRONIZAR VISTA SEMANA AL CAMBIAR selectedDate
  useEffect(() => {
    if (viewMode === 'week' && daysScrollRef.current && weekScrollRef.current) {
      const dayIndex = extendedDays.findIndex(date => isSameDate(date, selectedDate));
      
      if (dayIndex !== -1) {
        const scrollPosition = dayIndex * DAY_COLUMN_WIDTH;
        
        setTimeout(() => {
          daysScrollRef.current?.scrollTo({
            x: scrollPosition,
            animated: true
          });
          
          weekScrollRef.current?.scrollTo({
            x: scrollPosition,
            animated: true
          });
        }, 100);
      }
    }
  }, [viewMode, selectedDate]);

  const generateExtendedWeeks = (weeksCount: number = 20) => {
    const allDays: Date[] = [];
    const startOffset = -Math.floor(weeksCount / 2);
    
    for (let weekOffset = startOffset; weekOffset < startOffset + weeksCount; weekOffset++) {
      const referenceDate = new Date(currentDate);
      referenceDate.setDate(currentDate.getDate() + (weekOffset * 7));
      
      const startOfWeek = new Date(referenceDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day;
      startOfWeek.setDate(diff);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        allDays.push(date);
      }
    }
    
    return allDays;
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const calendarDays: Date[] = [];
    
    for (let i = startDay - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month - 1, new Date(year, month, 0).getDate() - i);
      calendarDays.push(prevMonthDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      calendarDays.push(currentDay);
    }
    
    const totalDays = calendarDays.length;
    const remainingDays = 42 - totalDays;
    
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      calendarDays.push(nextMonthDay);
    }
    
    return calendarDays;
  };

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
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    
    if (viewMode === 'week') {
      const todayIndex = extendedDays.findIndex(date => isSameDate(date, today));
      
      if (todayIndex !== -1 && daysScrollRef.current && weekScrollRef.current) {
        const scrollPosition = todayIndex * DAY_COLUMN_WIDTH;
        
        daysScrollRef.current.scrollTo({
          x: scrollPosition,
          animated: true
        });
        
        weekScrollRef.current.scrollTo({
          x: scrollPosition,
          animated: true
        });
      }
    }
  };

  // ✅ ABRIR PICKER DE MES/AÑO
  const openMonthPicker = () => {
    setPickerMonth(viewMode === 'month' ? currentDate.getMonth() : visibleMonth);
    setPickerYear(viewMode === 'month' ? currentDate.getFullYear() : visibleYear);
    setShowMonthPicker(true);
  };

  // ✅ APLICAR SELECCIÓN DE MES/AÑO
  const applyMonthYearSelection = () => {
    const newDate = new Date(pickerYear, pickerMonth, 1);
    setCurrentDate(newDate);
    setVisibleMonth(pickerMonth);
    setVisibleYear(pickerYear);
    setShowMonthPicker(false);
  };

  // ✅ BÚSQUEDA DE EVENTOS
  const filteredEvents = mockEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.technician.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateString(date);
    let events = mockEvents.filter(event => event.date === dateStr);
    
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

  const generateAllHours = () => {
    const hours = [];
    for (let i = 0; i <= 23; i++) {
      const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
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

  const calculateEventLayout = (event: MonitoringEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinutes = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinutes = parseInt(event.endTime.split(':')[1]);
    
    const startPosition = (startHour * 60 + startMinutes);
    const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes);
    
    return {
      top: startPosition,
      height: Math.max(duration, 30),
      duration: duration
    };
  };

  const handleDaysScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const dayIndex = Math.round(scrollX / DAY_COLUMN_WIDTH);
    
    if (extendedDays[dayIndex]) {
      const visibleDate = extendedDays[dayIndex];
      setVisibleMonth(visibleDate.getMonth());
      setVisibleYear(visibleDate.getFullYear());
    }
    
    if (weekScrollRef.current) {
      weekScrollRef.current.scrollTo({
        x: scrollX,
        animated: false
      });
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = generateWeekDays();
  const extendedDays = generateExtendedWeeks(20);
  const selectedDateEvents = getEventsForDate(selectedDate);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const allHours = generateAllHours();

  const containerPadding = 32;
  const gridPadding = 16;
  const availableWidth = screenWidth - containerPadding - gridPadding;
  const cellWidth = Math.floor(availableWidth / 7);
  const DAY_COLUMN_WIDTH = 100;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* ✅ INDICADOR DE ESTADO DE FIREBASE */}
      {loading && (
        <View style={{ 
          position: 'absolute', 
          top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40, 
          right: 16, 
          zIndex: 1000,
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 12 }}>🔄 Sincronizando...</Text>
        </View>
      )}

      {/* HEADER ALINEADO A LA IZQUIERDA */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
        
        <View style={styles.headerContent}>
          {/* ✅ TÍTULO ALINEADO A LA IZQUIERDA */}
          <TouchableOpacity onPress={openMonthPicker} style={styles.monthYearContainer}>
            <Text style={[styles.monthYear, isDark && styles.monthYearDark]}>
              {viewMode === 'month' 
                ? `${monthNames[currentMonth]} ${currentYear}`
                : `${monthNames[visibleMonth]} ${visibleYear}`
              }
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={isDark ? '#FFFFFF' : '#000000'} 
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
          
          {/* ✅ ACCIONES ALINEADAS A LA DERECHA */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => setShowSearchModal(true)}
            >
              <Ionicons name="search-outline" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerActionButton} onPress={openCreateModal}>
              <Ionicons name="add" size={22} color={isDark ? THEME_COLOR_DARK : THEME_COLOR} />
            </TouchableOpacity>

            {/* ✅ BOTÓN DE PRUEBA TEMPORAL */}
            <TouchableOpacity 
              style={[styles.headerActionButton, { backgroundColor: 'orange', borderRadius: 8 }]} 
              onPress={createTestEvent}
            >
              <Text style={{ color: 'white', fontSize: 10 }}>TEST</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* ✅ SUBTITLE ALINEADO CON CONTROLES */}
        {viewMode === 'month' && (
          <View style={styles.subtitleContainer}>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {mockEvents.filter(e => e.status === 'scheduled').length} monitoreos programados
              {firestoreEvents.length > 0 && (
                <Text style={{ color: isDark ? THEME_COLOR_DARK : THEME_COLOR }}> • En vivo</Text>
              )}
            </Text>
          </View>
        )}
      </View>

      {/* CONTROLES */}
      <View style={[styles.controlsContainer, isDark && styles.controlsContainerDark]}>
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

          {/* ✅ BOTÓN HOY CON COLOR DEL TEMA */}
          <TouchableOpacity 
            style={[
              styles.todayButton, 
              { backgroundColor: isDark ? THEME_COLOR_DARK : THEME_COLOR }
            ]} 
            onPress={goToToday}
          >
            <Text style={styles.todayButtonText}>Hoy</Text>
          </TouchableOpacity>
        </View>

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

      {/* CONTENIDO */}
      <View style={styles.content}>
        {viewMode === 'month' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
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

            <View style={[styles.daysGrid, isDark && styles.daysGridDark]}>
              {calendarDays.map((date, index) => {
                const dayOfMonth = date.getDate();
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isSelected = isSameDate(date, selectedDate);
                const isTodayDate = isToday(date);
                const dayEvents = getEventsForDate(date);
                
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
                        isSaturdayDay && isCurrentMonth && (isDark ? styles.saturdayDayTextDark : styles.saturdayDayText),
                        isSundayDay && isCurrentMonth && (isDark ? styles.sundayDayTextDark : styles.sundayDayText),
                        !isCurrentMonth && styles.otherMonthText,
                      ]}>
                        {dayOfMonth}
                      </Text>
                    </View>

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
                    
                    {isSundayDay && isCurrentMonth && !hasEvents(date) && (
                      <View style={styles.sundayIndicator}>
                        <Ionicons name="time-outline" size={10} color={isDark ? "#BF5AF2" : "#8E4EC6"} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

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
          </ScrollView>
        ) : (
          <View style={[styles.weekViewContainer, isDark && styles.weekViewContainerDark]}>
            <View style={[styles.weekHeaderFixed, isDark && styles.weekHeaderFixedDark]}>
              <View style={[styles.timeHeaderCorner, isDark && styles.timeHeaderCornerDark]} />
              <ScrollView
                ref={weekScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                scrollEnabled={false}
              >
                {extendedDays.map((date, index) => {
                  const isTodayDate = isToday(date);
                  const isSelectedDate = isSameDate(date, selectedDate);
                  const isSaturdayDay = date.getDay() === 6;
                  const isSundayDay = date.getDay() === 0;
                  
                  return (
                    <TouchableOpacity
                      key={`header-${index}-${date.getTime()}`}
                      style={[styles.dayHeaderColumn, { width: DAY_COLUMN_WIDTH }]}
                      onPress={() => setSelectedDate(new Date(date))}
                    >
                      <Text style={[
                        styles.dayHeaderLabel,
                        isDark && styles.dayHeaderLabelDark,
                        isSundayDay && (isDark ? styles.weekDaySundayDark : styles.weekDaySunday),
                        isSaturdayDay && (isDark ? styles.weekDaySaturdayDark : styles.weekDaySaturday)
                      ]}>
                        {dayNamesShort[date.getDay()]}
                      </Text>
                      <View style={[
                        styles.dayHeaderNumber,
                        isTodayDate && (isDark ? styles.todayCircleDark : styles.todayCircle),
                        isSelectedDate && !isTodayDate && (isDark ? styles.selectedCircleDark : styles.selectedCircle)
                      ]}>
                        <Text style={[
                          styles.dayHeaderNumberText,
                          isDark && styles.dayHeaderNumberTextDark,
                          (isTodayDate || isSelectedDate) && styles.dayHeaderNumberTextActive
                        ]}>
                          {date.getDate()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <ScrollView style={styles.weekScrollContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.weekGridContainer}>
                <View style={[styles.timeColumn, isDark && styles.timeColumnDark]}>
                  {allHours.map((hour) => (
                    <View key={`time-${hour.hour24}`} style={styles.timeSlot}>
                      <Text style={[styles.timeLabel, isDark && styles.timeLabelDark]}>
                        {hour.short}
                      </Text>
                    </View>
                  ))}
                </View>

                <ScrollView
                  ref={daysScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScroll={handleDaysScroll}
                >
                  <View style={styles.daysContainer}>
                    {allHours.map((hour) => (
                      <View
                        key={`grid-${hour.hour24}`}
                        style={[
                          styles.gridLine,
                          isDark && styles.gridLineDark,
                          { width: DAY_COLUMN_WIDTH * extendedDays.length }
                        ]}
                      />
                    ))}

                    {extendedDays.map((date, dayIndex) => {
                      const dayEvents = getEventsForDate(date);
                      
                      return (
                        <View
                          key={`day-${dayIndex}-${date.getTime()}`}
                          style={[
                            styles.dayColumn,
                            isDark && styles.dayColumnDark,
                            { width: DAY_COLUMN_WIDTH, left: dayIndex * DAY_COLUMN_WIDTH }
                          ]}
                        >
                          {dayEvents.map((event) => {
                            const layout = calculateEventLayout(event);
                            
                            return (
                              <TouchableOpacity
                                key={`event-${event.id}-${dayIndex}`}
                                style={[
                                  styles.weekEvent,
                                  {
                                    top: layout.top,
                                    height: layout.height,
                                    backgroundColor: isDark 
                                      ? matrixConfig[event.matrix].darkColor 
                                      : matrixConfig[event.matrix].color,
                                  }
                                ]}
                              >
                                <Text style={styles.weekEventTitle} numberOfLines={2}>
                                  {event.title}
                                </Text>
                                <Text style={styles.weekEventTime}>
                                  {event.startTime}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* ✅ MODAL PICKER DE MES/AÑO */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Text style={[styles.pickerButton, isDark && styles.pickerButtonDark]}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, isDark && styles.pickerTitleDark]}>Seleccionar Fecha</Text>
              <TouchableOpacity onPress={applyMonthYearSelection}>
                <Text style={[styles.pickerButton, styles.pickerButtonDone]}>Listo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickersRow}>
              <Picker
                selectedValue={pickerMonth}
                style={[styles.picker, isDark && styles.pickerDark]}
                onValueChange={(value) => setPickerMonth(value)}
              >
                {monthNames.map((month, index) => (
                  <Picker.Item key={index} label={month} value={index} color={isDark ? '#FFFFFF' : '#000000'} />
                ))}
              </Picker>
              
              <Picker
                selectedValue={pickerYear}
                style={[styles.picker, isDark && styles.pickerDark]}
                onValueChange={(value) => setPickerYear(value)}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <Picker.Item key={year} label={String(year)} value={year} color={isDark ? '#FFFFFF' : '#000000'} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ MODAL DE BÚSQUEDA */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
          <View style={[styles.searchHeader, isDark && styles.searchHeaderDark]}>
            <View style={[styles.searchInputContainer, isDark && styles.searchInputContainerDark]}>
              <Ionicons name="search" size={20} color="#8E8E93" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, isDark && styles.searchInputDark]}
                placeholder="Buscar eventos..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
            <TouchableOpacity onPress={() => { setShowSearchModal(false); setSearchQuery(''); }}>
              <Text style={[styles.cancelButton, { color: isDark ? THEME_COLOR_DARK : THEME_COLOR }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.searchResults}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.searchResultItem, isDark && styles.searchResultItemDark]}
                  onPress={() => {
                    const eventDate = new Date(event.date);
                    setSelectedDate(eventDate);
                    setCurrentDate(eventDate);
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={[styles.searchResultBar, { backgroundColor: isDark ? matrixConfig[event.matrix].darkColor : matrixConfig[event.matrix].color }]} />
                  <View style={styles.searchResultContent}>
                    <Text style={[styles.searchResultTitle, isDark && styles.searchResultTitleDark]}>{event.title}</Text>
                    <Text style={[styles.searchResultDetails, isDark && styles.searchResultDetailsDark]}>
                      {event.date} • {event.startTime} - {event.endTime}
                    </Text>
                    <Text style={[styles.searchResultLocation, isDark && styles.searchResultLocationDark]}>
                      📍 {event.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noSearchResults}>
                <Ionicons name="search-outline" size={64} color="#8E8E93" />
                <Text style={[styles.noSearchResultsText, isDark && styles.noSearchResultsTextDark]}>
                  {searchQuery ? 'No se encontraron eventos' : 'Busca eventos por título, ubicación o técnico'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <CreateEventModal
        isVisible={showCreateModal}
        onClose={closeCreateModal}
        onCreateEvent={handleCreateEvent} // ✅ FUNCIÓN REAL
        selectedDate={selectedDate}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  
  header: {
    backgroundColor: '#F2F2F7',
    paddingBottom: 8,
  },
  headerDark: {
    backgroundColor: '#000000',
  },
  
  // ✅ ACTUALIZADO - Header content alineado a la izquierda
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  // ✅ ACTUALIZADO - Título alineado a la izquierda
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  monthYear: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  monthYearDark: {
    color: '#FFFFFF',
  },
  
  // ✅ ACTUALIZADO - Acciones a la derecha
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  
  headerActionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  
  // ✅ ACTUALIZADO - Subtitle alineado con controles
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  subtitleDark: {
    color: '#8E8E93',
  },

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
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

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
  },

  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
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
    marginHorizontal: 16,
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

  weekViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  weekViewContainerDark: {
    backgroundColor: '#000000',
  },

  weekHeaderFixed: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  weekHeaderFixedDark: {
    backgroundColor: '#000000',
    borderBottomColor: '#38383A',
  },

  timeHeaderCorner: {
    width: 70,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  timeHeaderCornerDark: {
    backgroundColor: '#000000',
    borderRightColor: '#38383A',
  },

  dayHeaderColumn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },

  dayHeaderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  abelDark: {
    color: '#8E8E93',
  },

  dayHeaderNumber: {
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

  dayHeaderNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  dayHeaderNumberTextDark: {
    color: '#FFFFFF',
  },
  dayHeaderNumberTextActive: {
    color: '#FFFFFF',
  },

  weekScrollContainer: {
    flex: 1,
  },

  weekGridContainer: {
    flexDirection: 'row',
  },

  timeColumn: {
    width: 70,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  timeColumnDark: {
    backgroundColor: '#000000',
    borderRightColor: '#38383A',
  },

  timeSlot: {
    height: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },

  timeLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  timeLabelDark: {
    color: '#8E8E93',
  },

  daysContainer: {
    position: 'relative',
  },

  gridLine: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  gridLineDark: {
    borderBottomColor: '#1C1C1E',
  },

  dayColumn: {
    position: 'absolute',
    top: 0,
    height: 60 * 24,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  dayColumnDark: {
    borderRightColor: '#38383A',
  },

  weekEvent: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 4,
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255,255,255,0.5)',
  },

  weekEventTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  weekEventTime: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  dayEvents: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
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

  // ✅ ESTILOS DEL MODAL PICKER
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  pickerContainerDark: {
    backgroundColor: '#1C1C1E',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  pickerTitleDark: {
    color: '#FFFFFF',
  },
  pickerButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  pickerButtonDark: {
    color: '#0A84FF',
  },
  pickerButtonDone: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  pickersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  picker: {
    flex: 1,
    height: 200,
  },
  pickerDark: {
    backgroundColor: '#1C1C1E',
  },

  // ✅ ESTILOS DEL MODAL DE BÚSQUEDA
  searchContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainerDark: {
    backgroundColor: '#000000',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchHeaderDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInputContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
  },
  searchInputDark: {
    color: '#FFFFFF',
  },
  cancelButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  searchResults: {
    flex: 1,
    paddingTop: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultItemDark: {
    backgroundColor: '#1C1C1E',
  },
  searchResultBar: {
    width: 4,
  },
  searchResultContent: {
    flex: 1,
    padding: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  searchResultTitleDark: {
    color: '#FFFFFF',
  },
  searchResultDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  searchResultDetailsDark: {
    color: '#8E8E93',
  },
  searchResultLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  searchResultLocationDark: {
    color: '#8E8E93',
  },
  noSearchResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noSearchResultsText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
  },
  noSearchResultsTextDark: {
    color: '#8E8E93',
  },
});