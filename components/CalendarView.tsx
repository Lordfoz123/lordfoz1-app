import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useEvents } from '../hooks/useEvents';
import { auth, MonitoringEvent } from '../services/firebase';
import { CreateEventModal } from './CreateEventModal';

const { width: screenWidth } = Dimensions.get('window');

type MatrixFilter = 'all' | 'aire' | 'agua' | 'suelo' | 'ruido';

export default function CalendarView() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { events: firestoreEvents, loading, error, createEvent } = useEvents();
  
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState<MatrixFilter>('all');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth());
  const [visibleYear, setVisibleYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());
  const [pickerYear, setPickerYear] = useState(today.getFullYear());

  const weekScrollRef = useRef<ScrollView>(null);
  const daysScrollRef = useRef<ScrollView>(null);

  // Verificación de autenticación silenciosa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Autenticación manejada silenciosamente
    });
    return unsubscribe;
  }, []);

  const extendedDays = useMemo(() => {
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

    return generateExtendedWeeks(20);
  }, [currentDate]);

  const weekDays = useMemo(() => {
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

    return generateWeekDays();
  }, [currentDate]);

  const calendarDays = useMemo(() => {
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

    return generateCalendarDays();
  }, [currentDate]);

  useEffect(() => {
    if (viewMode === 'week' && daysScrollRef.current && weekScrollRef.current && extendedDays.length > 0) {
      const dayIndex = extendedDays.findIndex(date => isSameDate(date, selectedDate));
      
      if (dayIndex !== -1) {
        const DAY_COLUMN_WIDTH = 100;
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
  }, [viewMode, selectedDate, extendedDays]);

  const THEME_COLOR = '#4CAF50';
  const THEME_COLOR_DARK = '#4CAF50';

  const mockEventsFallback: MonitoringEvent[] = [
    {
      id: 'demo-1',
      title: 'Monitoreo de Calidad de Aire',
      date: '2025-11-20',
      startTime: '08:00',
      endTime: '10:30',
      description: 'Medición de PM2.5 y PM10 en zona urbana',
      location: 'Centro de Lima',
      type: 'monitoring',
      priority: 'high',
      status: 'scheduled'
    },
    {
      id: 'demo-2',
      title: 'Análisis de Calidad de Agua',
      date: '2025-11-21',
      startTime: '14:00',
      endTime: '16:00',
      description: 'Evaluación fisicoquímica del agua potable',
      location: 'Planta de Tratamiento Huachipa',
      type: 'monitoring',
      priority: 'medium',
      status: 'scheduled'
    },
    {
      id: 'demo-3',
      title: 'Evaluación de Suelos Agrícolas',
      date: '2025-11-22',
      startTime: '09:00',
      endTime: '12:00',
      description: 'Análisis de metales pesados en suelos',
      location: 'Valle de Lurín',
      type: 'monitoring',
      priority: 'high',
      status: 'scheduled'
    }
  ];

  const mockEvents = firestoreEvents.length > 0 ? firestoreEvents : mockEventsFallback;

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

  // Función principal para crear eventos
  const handleCreateEvent = async (eventData: Omit<MonitoringEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createEvent(eventData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error al crear evento:', error);
    }
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
        const DAY_COLUMN_WIDTH = 100;
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

  const openMonthPicker = () => {
    setPickerMonth(viewMode === 'month' ? currentDate.getMonth() : visibleMonth);
    setPickerYear(viewMode === 'month' ? currentDate.getFullYear() : visibleYear);
    setShowMonthPicker(true);
  };

  const applyMonthYearSelection = () => {
    const newDate = new Date(pickerYear, pickerMonth, 1);
    setCurrentDate(newDate);
    setVisibleMonth(pickerMonth);
    setVisibleYear(pickerYear);
    setShowMonthPicker(false);
  };

  const filteredEvents = mockEvents.filter(event => {
    const searchTerm = searchQuery.toLowerCase();
    return event.title.toLowerCase().includes(searchTerm) ||
           event.location?.toLowerCase().includes(searchTerm) ||
           event.description?.toLowerCase().includes(searchTerm);
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateString(date);
    let events = mockEvents.filter(event => event.date === dateStr);
    
    if (matrixFilter !== 'all') {
      events = events.filter(event => event.type === matrixFilter);
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

  const selectedDateEvents = getEventsForDate(selectedDate);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const containerPadding = 32;
  const gridPadding = 16;
  const availableWidth = screenWidth - containerPadding - gridPadding;
  const cellWidth = Math.floor(availableWidth / 7);

  if (loading && firestoreEvents.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.centerContainer]}>
        <Ionicons name="sync" size={48} color={isDark ? '#8E8E93' : '#C7C7CC'} />
        <Text style={[styles.loadingTitle, isDark && styles.loadingTitleDark]}>
          Cargando eventos
        </Text>
        <Text style={[styles.loadingSubtitle, isDark && styles.loadingSubtitleDark]}>
          Conectando con la base de datos...
        </Text>
      </View>
    );
  }

  if (error && firestoreEvents.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.centerContainer]}>
        <Ionicons name="cloud-offline" size={48} color="#FF6B6B" />
        <Text style={[styles.errorTitle, isDark && styles.errorTitleDark]}>
          Conexión limitada
        </Text>
        <Text style={[styles.errorSubtitle, isDark && styles.errorSubtitleDark]}>
          {error}
        </Text>
        <Text style={[styles.errorMessage, isDark && styles.errorMessageDark]}>
          Mostrando datos de ejemplo
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {loading && (
        <View style={styles.syncIndicator}>
          <View style={[styles.syncBadge, isDark && styles.syncBadgeDark]}>
            <Ionicons name="sync" size={12} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.syncText, isDark && styles.syncTextDark]}>
              Sincronizando
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.statusBarSpacer} />
        
        <View style={styles.headerContent}>
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
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => setShowSearchModal(true)}
            >
              <Ionicons name="search-outline" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
            </TouchableOpacity>
            
            {/* Botón principal para crear eventos */}
            <TouchableOpacity 
              style={styles.headerActionButton} 
              onPress={openCreateModal}
            >
              <Ionicons name="add" size={22} color={isDark ? THEME_COLOR_DARK : THEME_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
        
        {viewMode === 'month' && (
          <View style={styles.subtitleContainer}>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {mockEvents.filter(e => e.status === 'scheduled').length} monitoreos programados
              {firestoreEvents.length > 0 && (
                <Text style={{ color: isDark ? THEME_COLOR_DARK : THEME_COLOR }}> • En tiempo real</Text>
              )}
            </Text>
          </View>
        )}
      </View>

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

          <TouchableOpacity 
            style={[styles.todayButton, { backgroundColor: isDark ? THEME_COLOR_DARK : THEME_COLOR }]} 
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
                        {dayEvents.slice(0, 3).map((event, idx) => {
                          const eventType = event.type || 'monitoring';
                          const config = matrixConfig[eventType] || matrixConfig.aire;
                          return (
                            <View
                              key={`${event.id}-${idx}`}
                              style={[
                                styles.eventDot,
                                { backgroundColor: isDark ? config.darkColor : config.color }
                              ]}
                            />
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <Text style={[styles.moreEventsText, isDark && styles.moreEventsTextDark]}>
                            +{dayEvents.length - 3}
                          </Text>
                        )}
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
                   `${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`}
                </Text>
                <View style={styles.eventStats}>
                  <Text style={[styles.eventCount, isDark && styles.eventCountDark]}>
                    {selectedDateEvents.length} evento{selectedDateEvents.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => {
                  const eventType = event.type || 'monitoring';
                  const config = matrixConfig[eventType] || matrixConfig.aire;
                  
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={[styles.eventCard, isDark && styles.eventCardDark]}
                    >
                      <View style={[
                        styles.priorityBar, 
                        { backgroundColor: isDark ? config.darkColor : config.color }
                      ]} />
                      
                      <View style={styles.eventContent}>
                        <View style={styles.eventHeader}>
                          <Text style={[styles.eventTitle, isDark && styles.eventTitleDark]}>
                            {event.title}
                          </Text>
                          <View style={styles.eventIcons}>
                            <Ionicons
                              name={config.icon as any}
                              size={16}
                              color={isDark ? config.darkColor : config.color}
                            />
                            {event.priority === 'high' && (
                              <Ionicons name="alert-circle" size={14} color="#FF6B6B" />
                            )}
                          </View>
                        </View>
                        
                        <Text style={[styles.eventTime, isDark && styles.eventTimeDark]}>
                          ⏰ {event.startTime} - {event.endTime || 'Sin hora fin'}
                        </Text>
                        
                        {event.description && (
                          <Text style={[styles.eventDescription, isDark && styles.eventDescriptionDark]}>
                            📋 {event.description}
                          </Text>
                        )}
                        
                        {event.location && (
                          <Text style={[styles.eventLocation, isDark && styles.eventLocationDark]}>
                            📍 {event.location}
                          </Text>
                        )}

                        {event.status && (
                          <View style={styles.statusContainer}>
                            <View style={[
                              styles.statusBadge,
                              event.status === 'completed' && styles.statusCompleted,
                              event.status === 'in-progress' && styles.statusInProgress,
                              event.status === 'scheduled' && styles.statusScheduled,
                              isDark && styles.statusBadgeDark
                            ]}>
                              <Text style={[
                                styles.statusText,
                                event.status === 'completed' && styles.statusTextCompleted,
                                event.status === 'in-progress' && styles.statusTextInProgress,
                                event.status === 'scheduled' && styles.statusTextScheduled
                              ]}>
                                {event.status === 'completed' ? 'Completado' :
                                 event.status === 'in-progress' ? 'En progreso' :
                                 event.status === 'scheduled' ? 'Programado' : 
                                 event.status}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noEvents}>
                  <Ionicons name="calendar-outline" size={48} color={isDark ? '#48484A' : '#C7C7CC'} />
                  <Text style={[styles.noEventsText, isDark && styles.noEventsTextDark]}>
                    No hay eventos programados
                  </Text>
                  <Text style={[styles.noEventsSubtext, isDark && styles.noEventsSubtextDark]}>
                    Toca el botón + para crear un nuevo monitoreo
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          // ✅ NUEVA IMPLEMENTACIÓN DE VISTA DE SEMANA
          <View style={[styles.weekViewContainer, isDark && styles.weekViewContainerDark]}>
            
            {/* Header de la semana */}
            <View style={[styles.weekHeader, isDark && styles.weekHeaderDark]}>
              <View style={styles.weekNavigation}>
                <TouchableOpacity 
                  style={[styles.weekNavButton, isDark && styles.weekNavButtonDark]}
                  onPress={goToPrevious}
                >
                  <Ionicons name="chevron-back" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </TouchableOpacity>
                
                <Text style={[styles.weekTitle, isDark && styles.weekTitleDark]}>
                  Semana del {weekDays[0].getDate()} de {monthNames[weekDays[0].getMonth()]}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.weekNavButton, isDark && styles.weekNavButtonDark]}
                  onPress={goToNext}
                >
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Días de la semana header */}
            <View style={[styles.weekDaysHeader, isDark && styles.weekDaysHeaderDark]}>
              {weekDays.map((date, index) => {
                const isToday = isSameDate(date, new Date());
                const isSelected = isSameDate(date, selectedDate);
                const dayEvents = getEventsForDate(date);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.weekDayColumn,
                      isSelected && (isDark ? styles.weekDaySelectedDark : styles.weekDaySelected)
                    ]}
                    onPress={() => setSelectedDate(new Date(date))}
                  >
                    <Text style={[
                      styles.weekDayName,
                      isDark && styles.weekDayNameDark,
                      isToday && styles.weekDayToday
                    ]}>
                      {dayNames[date.getDay()]}
                    </Text>
                    <View style={[
                      styles.weekDayNumber,
                      isToday && (isDark ? styles.weekDayTodayCircleDark : styles.weekDayTodayCircle),
                      isSelected && (isDark ? styles.weekDaySelectedCircleDark : styles.weekDaySelectedCircle)
                    ]}>
                      <Text style={[
                        styles.weekDayNumberText,
                        isDark && styles.weekDayNumberTextDark,
                        isToday && styles.weekDayTodayText,
                        isSelected && styles.weekDaySelectedText
                      ]}>
                        {date.getDate()}
                      </Text>
                    </View>
                    {dayEvents.length > 0 && (
                      <View style={styles.weekEventIndicator}>
                        <Text style={[styles.weekEventCount, isDark && styles.weekEventCountDark]}>
                          {dayEvents.length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Contenido de eventos de la semana */}
            <ScrollView style={styles.weekContent} showsVerticalScrollIndicator={false}>
              {weekDays.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date);
                const isToday = isSameDate(date, new Date());
                const isSelected = isSameDate(date, selectedDate);

                if (dayEvents.length === 0) return null;

                return (
                  <View 
                    key={`week-day-${dayIndex}`}
                    style={[
                      styles.weekDaySection,
                      isDark && styles.weekDaySectionDark,
                      isSelected && styles.weekDaySectionSelected
                    ]}
                  >
                    <View style={styles.weekDaySectionHeader}>
                      <Text style={[
                        styles.weekDaySectionTitle,
                        isDark && styles.weekDaySectionTitleDark,
                        isToday && (isDark ? styles.weekDaySectionTodayDark : styles.weekDaySectionToday)
                      ]}>
                        {isToday ? 'Hoy' : `${dayNames[date.getDay()]}, ${date.getDate()}`}
                      </Text>
                      <Text style={[styles.weekDaySectionCount, isDark && styles.weekDaySectionCountDark]}>
                        {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
                      </Text>
                    </View>

                    {dayEvents.map((event, eventIndex) => {
                      const eventType = event.type || 'monitoring';
                      const config = matrixConfig[eventType] || matrixConfig.aire;

                      return (
                        <TouchableOpacity
                          key={`week-event-${event.id}`}
                          style={[styles.weekEventCard, isDark && styles.weekEventCardDark]}
                        >
                          <View style={[
                            styles.weekEventTimeBar,
                            { backgroundColor: isDark ? config.darkColor : config.color }
                          ]} />
                          
                          <View style={styles.weekEventContent}>
                            <View style={styles.weekEventHeader}>
                              <View style={styles.weekEventTimeContainer}>
                                <Text style={[styles.weekEventTime, isDark && styles.weekEventTimeDark]}>
                                  {event.startTime}
                                </Text>
                                {event.endTime && (
                                  <Text style={[styles.weekEventTimeDivider, isDark && styles.weekEventTimeDividerDark]}>
                                    - {event.endTime}
                                  </Text>
                                )}
                              </View>
                              <View style={styles.weekEventIcons}>
                                <Ionicons
                                  name={config.icon as any}
                                  size={16}
                                  color={isDark ? config.darkColor : config.color}
                                />
                                {event.priority === 'high' && (
                                  <Ionicons name="alert-circle" size={14} color="#FF6B6B" />
                                )}
                              </View>
                            </View>

                            <Text style={[styles.weekEventTitle, isDark && styles.weekEventTitleDark]}>
                              {event.title}
                            </Text>

                            {event.location && (
                              <Text style={[styles.weekEventLocation, isDark && styles.weekEventLocationDark]}>
                                📍 {event.location}
                              </Text>
                            )}

                            {event.assignedTo && (
                              <Text style={[styles.weekEventTechnician, isDark && styles.weekEventTechnicianDark]}>
                                👤 {event.assignedTo}
                              </Text>
                            )}

                            {event.status && (
                              <View style={styles.weekEventStatusContainer}>
                                <View style={[
                                  styles.weekEventStatus,
                                  event.status === 'completed' && styles.statusCompleted,
                                  event.status === 'in-progress' && styles.statusInProgress,
                                  event.status === 'scheduled' && styles.statusScheduled,
                                  isDark && styles.weekEventStatusDark
                                ]}>
                                  <Text style={[
                                    styles.weekEventStatusText,
                                    event.status === 'completed' && styles.statusTextCompleted,
                                    event.status === 'in-progress' && styles.statusTextInProgress,
                                    event.status === 'scheduled' && styles.statusTextScheduled
                                  ]}>
                                    {event.status === 'completed' ? 'Completado' :
                                     event.status === 'in-progress' ? 'En progreso' :
                                     event.status === 'scheduled' ? 'Programado' : 
                                     event.status}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}

              {/* Mensaje cuando no hay eventos en la semana */}
              {weekDays.every(date => getEventsForDate(date).length === 0) && (
                <View style={styles.weekNoEvents}>
                  <Ionicons name="calendar-outline" size={64} color={isDark ? '#48484A' : '#C7C7CC'} />
                  <Text style={[styles.weekNoEventsTitle, isDark && styles.weekNoEventsTitleDark]}>
                    Sin eventos esta semana
                  </Text>
                  <Text style={[styles.weekNoEventsSubtitle, isDark && styles.weekNoEventsSubtitleDark]}>
                    Toca el botón + para programar un nuevo monitoreo
                  </Text>
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        )}
      </View>

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
                <Text style={[styles.pickerButton, isDark && styles.pickerButtonDark]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, isDark && styles.pickerTitleDark]}>
                Seleccionar Fecha
              </Text>
              <TouchableOpacity onPress={applyMonthYearSelection}>
                <Text style={[styles.pickerButton, styles.pickerButtonDone]}>
                  Listo
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickersRow}>
              <Picker
                selectedValue={pickerMonth}
                style={[styles.picker, isDark && styles.pickerDark]}
                onValueChange={(value) => setPickerMonth(value)}
              >
                {monthNames.map((month, index) => (
                  <Picker.Item 
                    key={index} 
                    label={month} 
                    value={index} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                  />
                ))}
              </Picker>
              
              <Picker
                selectedValue={pickerYear}
                style={[styles.picker, isDark && styles.pickerDark]}
                onValueChange={(value) => setPickerYear(value)}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <Picker.Item 
                    key={year} 
                    label={String(year)} 
                    value={year} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
          <View style={[styles.searchHeader, isDark && styles.searchHeaderDark]}>
            <View style={[styles.searchInputContainer, isDark && styles.searchInputContainerDark]}>
              <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, isDark && styles.searchInputDark]}
                placeholder="Buscar eventos, ubicaciones..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity 
              onPress={() => { 
                setShowSearchModal(false); 
                setSearchQuery(''); 
              }}
            >
              <Text style={[styles.cancelButton, { color: isDark ? THEME_COLOR_DARK : THEME_COLOR }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.searchResults}>
            {searchQuery.trim() === '' ? (
              <View style={styles.searchEmptyState}>
                <Ionicons name="search-outline" size={64} color={isDark ? '#48484A' : '#C7C7CC'} />
                <Text style={[styles.searchEmptyTitle, isDark && styles.searchEmptyTitleDark]}>
                  Buscar Eventos
                </Text>
                <Text style={[styles.searchEmptySubtitle, isDark && styles.searchEmptySubtitleDark]}>
                  Busca por título, ubicación o descripción
                </Text>
              </View>
            ) : filteredEvents.length > 0 ? (
              <>
                <View style={styles.searchResultsHeader}>
                  <Text style={[styles.searchResultsCount, isDark && styles.searchResultsCountDark]}>
                    {filteredEvents.length} resultado{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {filteredEvents.map((event) => {
                  const eventType = event.type || 'monitoring';
                  const config = matrixConfig[eventType] || matrixConfig.aire;
                  
                  return (
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
                      <View style={[
                        styles.searchResultBar, 
                        { backgroundColor: isDark ? config.darkColor : config.color }
                      ]} />
                      <View style={styles.searchResultContent}>
                        <View style={styles.searchResultHeader}>
                          <Text style={[styles.searchResultTitle, isDark && styles.searchResultTitleDark]}>
                            {event.title}
                          </Text>
                          <Ionicons
                            name={config.icon as any}
                            size={16}
                            color={isDark ? config.darkColor : config.color}
                          />
                        </View>
                        <Text style={[styles.searchResultDetails, isDark && styles.searchResultDetailsDark]}>
                          {event.date} • {event.startTime} - {event.endTime || 'Sin hora fin'}
                        </Text>
                        {event.location && (
                          <Text style={[styles.searchResultLocation, isDark && styles.searchResultLocationDark]}>
                            📍 {event.location}
                          </Text>
                        )}
                        {event.description && (
                          <Text style={[styles.searchResultDescription, isDark && styles.searchResultDescriptionDark]}>
                            {event.description}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <View style={styles.noSearchResults}>
                <Ionicons name="document-outline" size={64} color={isDark ? '#48484A' : '#C7C7CC'} />
                <Text style={[styles.noSearchResultsText, isDark && styles.noSearchResultsTextDark]}>
                  Sin resultados
                </Text>
                <Text style={[styles.noSearchResultsSubtext, isDark && styles.noSearchResultsSubtextDark]}>
                  No se encontraron eventos para "{searchQuery}"
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de crear evento limpio */}
      <CreateEventModal
        isVisible={showCreateModal}
        onClose={closeCreateModal}
        onCreateEvent={handleCreateEvent}
        selectedDate={selectedDate}
        isDark={isDark}
      />
    </View>
  );
}

// ===================================
// 🎨 ESTILOS COMPLETOS
// ===================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingTitleDark: {
    color: '#FFFFFF',
  },
  
  loadingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingSubtitleDark: {
    color: '#8E8E93',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitleDark: {
    color: '#FF6B6B',
  },
  
  errorSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  errorSubtitleDark: {
    color: '#8E8E93',
  },

  errorMessage: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorMessageDark: {
    color: '#8E8E93',
  },

  syncIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    right: 16,
    zIndex: 1000,
  },

  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  syncBadgeDark: {
    backgroundColor: '#1C1C1E',
  },

  syncText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  syncTextDark: {
    color: '#FFFFFF',
  },
  
  header: {
    backgroundColor: '#F2F2F7',
    paddingBottom: 8,
  },
  headerDark: {
    backgroundColor: '#000000',
  },

  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  monthYear: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  monthYearDark: {
    color: '#FFFFFF',
  },

  chevronIcon: {
    marginLeft: 6,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  headerActionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  
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
    borderRadius: 16,
  },
  
  todayCircle: {
    backgroundColor: '#FF3B30',
  },
  todayCircleDark: {
    backgroundColor: '#FF453A',
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
    maxWidth: 30,
  },

  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  moreEventsText: {
    fontSize: 8,
    color: '#8E8E93',
    fontWeight: '600',
    marginLeft: 2,
  },
  moreEventsTextDark: {
    color: '#8E8E93',
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
    fontWeight: '500',
  },
  eventCountDark: {
    color: '#8E8E93',
  },
  
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  eventCardDark: {
    backgroundColor: '#2C2C2E',
  },
  
  priorityBar: {
    width: 4,
  },
  
  eventContent: {
    flex: 1,
    padding: 16,
  },

  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
        color: '#000000',
    flex: 1,
    lineHeight: 22,
  },
  eventTitleDark: {
    color: '#FFFFFF',
  },

  eventIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },

  eventTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
    fontWeight: '500',
  },
  eventTimeDark: {
    color: '#8E8E93',
  },

  eventDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    lineHeight: 18,
  },
  eventDescriptionDark: {
    color: '#ACACAC',
  },

  eventLocation: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '500',
  },
  eventLocationDark: {
    color: '#8E8E93',
  },

  statusContainer: {
    alignItems: 'flex-start',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  statusBadgeDark: {
    backgroundColor: '#3A3A3C',
  },

  statusCompleted: {
    backgroundColor: '#E8F5E8',
  },
  statusInProgress: {
    backgroundColor: '#FFF3CD',
  },
  statusScheduled: {
    backgroundColor: '#E3F2FD',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },

  statusTextCompleted: {
    color: '#2E7D32',
  },
  statusTextInProgress: {
    color: '#F57F17',
  },
  statusTextScheduled: {
    color: '#1976D2',
  },
  
  noEvents: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C7C7CC',
    marginTop: 16,
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
  },
  noEventsSubtextDark: {
    color: '#8E8E93',
  },

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
    fontWeight: '500',
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInputContainerDark: {
    backgroundColor: '#2C2C2E',
  },

  searchIcon: {
    marginRight: 8,
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

  searchEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },

  searchEmptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  searchEmptyTitleDark: {
    color: '#FFFFFF',
  },

  searchEmptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  searchEmptySubtitleDark: {
    color: '#8E8E93',
  },

  searchResultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  searchResultsCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  searchResultsCountDark: {
    color: '#8E8E93',
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
    padding: 16,
  },

  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    lineHeight: 22,
  },
  searchResultTitleDark: {
    color: '#FFFFFF',
  },

  searchResultDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
    fontWeight: '500',
  },
  searchResultDetailsDark: {
    color: '#8E8E93',
  },

  searchResultLocation: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
  },
  searchResultLocationDark: {
    color: '#8E8E93',
  },

  searchResultDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  searchResultDescriptionDark: {
    color: '#ACACAC',
  },

  noSearchResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },

  noSearchResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C7C7CC',
    marginTop: 16,
    textAlign: 'center',
  },
  noSearchResultsTextDark: {
    color: '#48484A',
  },

  noSearchResultsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  noSearchResultsSubtextDark: {
    color: '#8E8E93',
  },

  // ===================================
  // 🗓️ ESTILOS DE VISTA DE SEMANA
  // ===================================
  weekViewContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  weekViewContainerDark: {
    backgroundColor: '#000000',
  },

  weekHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  weekHeaderDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },

  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  weekNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  weekNavButtonDark: {
    backgroundColor: '#2C2C2E',
  },

  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  weekTitleDark: {
    color: '#FFFFFF',
  },

  weekDaysHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  weekDaysHeaderDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },

  weekDayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },

  weekDaySelected: {
    backgroundColor: '#E5E5EA',
  },
  weekDaySelectedDark: {
    backgroundColor: '#2C2C2E',
  },

  weekDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  weekDayNameDark: {
    color: '#8E8E93',
  },

  weekDayToday: {
    color: '#4CAF50',
    fontWeight: '700',
  },

  weekDayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  weekDayTodayCircle: {
    backgroundColor: '#FF3B30',
  },
  weekDayTodayCircleDark: {
    backgroundColor: '#FF453A',
  },

  weekDaySelectedCircle: {
    backgroundColor: '#4CAF50',
  },
  weekDaySelectedCircleDark: {
    backgroundColor: '#30D158',
  },

  weekDayNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  weekDayNumberTextDark: {
    color: '#FFFFFF',
  },

  weekDayTodayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  weekDaySelectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  weekEventIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },

  weekEventCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekEventCountDark: {
    color: '#FFFFFF',
  },

  weekContent: {
    flex: 1,
    paddingTop: 16,
  },

  weekDaySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekDaySectionDark: {
    backgroundColor: '#1C1C1E',
  },

  weekDaySectionSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },

  weekDaySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  weekDaySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  weekDaySectionTitleDark: {
    color: '#FFFFFF',
  },

  weekDaySectionToday: {
    color: '#4CAF50',
  },
  weekDaySectionTodayDark: {
    color: '#30D158',
  },

  weekDaySectionCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  weekDaySectionCountDark: {
    color: '#8E8E93',
  },

  weekEventCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  weekEventCardDark: {
    backgroundColor: '#2C2C2E',
  },

  weekEventTimeBar: {
    width: 4,
  },

  weekEventContent: {
    flex: 1,
    padding: 12,
  },

  weekEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  weekEventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  weekEventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  weekEventTimeDark: {
    color: '#30D158',
  },

  weekEventTimeDivider: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  weekEventTimeDividerDark: {
    color: '#8E8E93',
  },

  weekEventIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  weekEventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  weekEventTitleDark: {
    color: '#FFFFFF',
  },

  weekEventLocation: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 3,
  },
  weekEventLocationDark: {
    color: '#ACACAC',
  },

  weekEventTechnician: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  weekEventTechnicianDark: {
    color: '#ACACAC',
  },

  weekEventStatusContainer: {
    alignItems: 'flex-start',
  },

  weekEventStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  weekEventStatusDark: {
    backgroundColor: '#3A3A3C',
  },

  weekEventStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },

  weekNoEvents: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  weekNoEventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C7C7CC',
    marginTop: 16,
    textAlign: 'center',
  },
  weekNoEventsTitleDark: {
    color: '#48484A',
  },

  weekNoEventsSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  weekNoEventsSubtitleDark: {
    color: '#8E8E93',
  },
});
    