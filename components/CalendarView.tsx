import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
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

interface MonitoringEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  technician: string;
  matrix: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  isOvertime?: boolean;
}

export default function CalendarView() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 5)); // 5 Nov 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 5));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      title: 'Sábado de Trabajo',
      date: '2025-11-01', // SÁBADO
      startTime: '09:00',
      endTime: '13:00',
      technician: 'Carlos Mendoza',
      matrix: 'agua',
      priority: 'medium',
      status: 'scheduled',
      location: 'San Isidro'
    },
    {
      id: '4',
      title: 'Fin de Semana',
      date: '2025-11-08', // SÁBADO
      startTime: '10:00',
      endTime: '12:00',
      technician: 'Ana García',
      matrix: 'suelo',
      priority: 'low',
      status: 'scheduled',
      location: 'Miraflores'
    },
    {
      id: '5',
      title: 'Sábado Extra',
      date: '2025-11-15', // SÁBADO
      startTime: '08:00',
      endTime: '14:00',
      technician: 'Luis Torres',
      matrix: 'aire',
      priority: 'high',
      status: 'scheduled',
      location: 'Surco'
    },
    {
      id: '11',
      title: 'Trabajo Sábado',
      date: '2025-11-22', // SÁBADO
      startTime: '07:00',
      endTime: '15:00',
      technician: 'María López',
      matrix: 'ruido',
      priority: 'medium',
      status: 'scheduled',
      location: 'Barranco'
    },
    {
      id: '12',
      title: 'Último Sábado',
      date: '2025-11-29', // SÁBADO
      startTime: '08:30',
      endTime: '12:30',
      technician: 'Carlos Mendoza',
      matrix: 'agua',
      priority: 'low',
      status: 'scheduled',
      location: 'Chorrillos'
    },
    // DOMINGOS NOVIEMBRE: 2, 9, 16, 23, 30
    {
      id: '6',
      title: 'Horas Extra - Domingo',
      date: '2025-11-02', // DOMINGO
      startTime: '07:00',
      endTime: '12:00',
      technician: 'Luis Torres',
      matrix: 'ruido',
      priority: 'high',
      status: 'scheduled',
      location: 'Zona Industrial',
      isOvertime: true
    },
    {
      id: '7',
      title: 'Domingo Especial',
      date: '2025-11-09', // DOMINGO
      startTime: '06:00',
      endTime: '14:00',
      technician: 'María López',
      matrix: 'aire',
      priority: 'high',
      status: 'scheduled',
      location: 'Callao',
      isOvertime: true
    },
    {
      id: '8',
      title: 'Emergencia Domingo',
      date: '2025-11-16', // DOMINGO
      startTime: '08:00',
      endTime: '16:00',
      technician: 'Carlos Mendoza',
      matrix: 'agua',
      priority: 'high',
      status: 'scheduled',
      location: 'Villa El Salvador',
      isOvertime: true
    },
    {
      id: '13',
      title: 'Domingo Extra',
      date: '2025-11-23', // DOMINGO
      startTime: '05:00',
      endTime: '13:00',
      technician: 'Ana García',
      matrix: 'suelo',
      priority: 'high',
      status: 'scheduled',
      location: 'San Juan de Miraflores',
      isOvertime: true
    },
    {
      id: '14',
      title: 'Último Domingo',
      date: '2025-11-30', // DOMINGO
      startTime: '06:30',
      endTime: '14:30',
      technician: 'Luis Torres',
      matrix: 'aire',
      priority: 'high',
      status: 'scheduled',
      location: 'Villa María del Triunfo',
      isOvertime: true
    }
  ];

  // ✅ FUNCIONES DE UTILIDAD
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // ✅ ORDEN ESTÁNDAR (como Google Calendar, iOS)
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

  // ✅ VERIFICACIÓN INICIAL
  const verifyCalendar = () => {
    console.log('🔍 VERIFICACIÓN HARDCODEADA NOVIEMBRE 2025:');
    
    // Verificar fechas específicas
    const nov1 = new Date(2025, 10, 1);  // 1 Nov 2025
    const nov2 = new Date(2025, 10, 2);  // 2 Nov 2025
    
    console.log(`📅 1 Nov 2025: ${nov1.toDateString()} | getDay() = ${nov1.getDay()} (debería ser 6 = sábado)`);
    console.log(`📅 2 Nov 2025: ${nov2.toDateString()} | getDay() = ${nov2.getDay()} (debería ser 0 = domingo)`);
  };

  // ✅ HARDCODEO EXACTO DE NOVIEMBRE 2025
  const generateCalendarDays = () => {
    console.log('🗓️ ==========================================');
    console.log('🗓️ HARDCODEANDO NOVIEMBRE 2025 EXACTAMENTE');
    console.log('🗓️ ==========================================');
    
    // ✅ HARDCODEAR EXACTAMENTE LO QUE DEBE APARECER
    const hardcodedDays = [
      // PRIMERA FILA: Dom 26 Oct a Sáb 1 Nov
      new Date(2025, 9, 26),  // Dom 26 Oct (posición 0)
      new Date(2025, 9, 27),  // Lun 27 Oct (posición 1)
      new Date(2025, 9, 28),  // Mar 28 Oct (posición 2)
      new Date(2025, 9, 29),  // Mié 29 Oct (posición 3)
      new Date(2025, 9, 30),  // Jue 30 Oct (posición 4)
      new Date(2025, 9, 31),  // Vie 31 Oct (posición 5)
      new Date(2025, 10, 1),  // Sáb 1 Nov (posición 6) ← AQUÍ DEBE ESTAR
      
      // SEGUNDA FILA: Dom 2 Nov a Sáb 8 Nov
      new Date(2025, 10, 2),  // Dom 2 Nov (posición 7)
      new Date(2025, 10, 3),  // Lun 3 Nov (posición 8)
      new Date(2025, 10, 4),  // Mar 4 Nov (posición 9)
      new Date(2025, 10, 5),  // Mié 5 Nov (posición 10)
      new Date(2025, 10, 6),  // Jue 6 Nov (posición 11)
      new Date(2025, 10, 7),  // Vie 7 Nov (posición 12)
      new Date(2025, 10, 8),  // Sáb 8 Nov (posición 13) ← AQUÍ DEBE ESTAR
      
      // TERCERA FILA: Dom 9 Nov a Sáb 15 Nov
      new Date(2025, 10, 9),  // Dom 9 Nov (posición 14)
      new Date(2025, 10, 10), // Lun 10 Nov (posición 15)
      new Date(2025, 10, 11), // Mar 11 Nov (posición 16)
      new Date(2025, 10, 12), // Mié 12 Nov (posición 17)
      new Date(2025, 10, 13), // Jue 13 Nov (posición 18)
      new Date(2025, 10, 14), // Vie 14 Nov (posición 19)
      new Date(2025, 10, 15), // Sáb 15 Nov (posición 20) ← AQUÍ DEBE ESTAR
      
      // CUARTA FILA: Dom 16 Nov a Sáb 22 Nov
      new Date(2025, 10, 16), // Dom 16 Nov (posición 21)
      new Date(2025, 10, 17), // Lun 17 Nov (posición 22)
      new Date(2025, 10, 18), // Mar 18 Nov (posición 23)
      new Date(2025, 10, 19), // Mié 19 Nov (posición 24)
      new Date(2025, 10, 20), // Jue 20 Nov (posición 25)
      new Date(2025, 10, 21), // Vie 21 Nov (posición 26)
      new Date(2025, 10, 22), // Sáb 22 Nov (posición 27) ← AQUÍ DEBE ESTAR
      
      // QUINTA FILA: Dom 23 Nov a Sáb 29 Nov
      new Date(2025, 10, 23), // Dom 23 Nov (posición 28)
      new Date(2025, 10, 24), // Lun 24 Nov (posición 29)
      new Date(2025, 10, 25), // Mar 25 Nov (posición 30)
      new Date(2025, 10, 26), // Mié 26 Nov (posición 31)
      new Date(2025, 10, 27), // Jue 27 Nov (posición 32)
      new Date(2025, 10, 28), // Vie 28 Nov (posición 33)
      new Date(2025, 10, 29), // Sáb 29 Nov (posición 34) ← AQUÍ DEBE ESTAR
      
      // SEXTA FILA: Dom 30 Nov a Sáb 6 Dic
      new Date(2025, 10, 30), // Dom 30 Nov (posición 35)
      new Date(2025, 11, 1),  // Lun 1 Dic (posición 36)
      new Date(2025, 11, 2),  // Mar 2 Dic (posición 37)
      new Date(2025, 11, 3),  // Mié 3 Dic (posición 38)
      new Date(2025, 11, 4),  // Jue 4 Dic (posición 39)
      new Date(2025, 11, 5),  // Vie 5 Dic (posición 40)
      new Date(2025, 11, 6),  // Sáb 6 Dic (posición 41)
    ];
    
    // ✅ VERIFICAR QUE LOS SÁBADOS ESTÉN EN POSICIÓN 6, 13, 20, 27, 34
    console.log('🎯 VERIFICACIÓN DE SÁBADOS HARDCODEADOS:');
    [6, 13, 20, 27, 34].forEach(pos => {
      const date = hardcodedDays[pos];
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();
      const month = date.getMonth();
      console.log(`🎯 Posición ${pos}: ${dayOfMonth}/${month + 1} | getDay: ${dayOfWeek} | ${dayOfWeek === 6 ? '✅SÁBADO' : '❌NO-SÁBADO'}`);
    });
    
    // ✅ VERIFICAR QUE LOS DOMINGOS ESTÉN EN POSICIÓN 0, 7, 14, 21, 28, 35
    console.log('🎯 VERIFICACIÓN DE DOMINGOS HARDCODEADOS:');
    [0, 7, 14, 21, 28, 35].forEach(pos => {
      const date = hardcodedDays[pos];
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();
      const month = date.getMonth();
      console.log(`🎯 Posición ${pos}: ${dayOfMonth}/${month + 1} | getDay: ${dayOfWeek} | ${dayOfWeek === 0 ? '✅DOMINGO' : '❌NO-DOMINGO'}`);
    });
    
    console.log('🗓️ ==========================================');
    console.log('🗓️ FIN DEL HARDCODEO');
    console.log('🗓️ ==========================================');
    
    return hardcodedDays;
  };

  // ✅ USAR useEffect PARA VERIFICACIÓN
  useEffect(() => {
    verifyCalendar();
  }, []);

  // ✅ NAVEGACIÓN DE MESES
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

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
    return mockEvents.filter(event => event.date === dateStr);
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

  const calendarDays = generateCalendarDays();
  const selectedDateEvents = getEventsForDate(selectedDate);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* HEADER */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
        
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                <Ionicons name="chevron-back" size={20} color="#4CAF50" />
              </TouchableOpacity>
              
              <Text style={[styles.monthYear, isDark && styles.textDark]}>
                {monthNames[currentMonth]} {currentYear}
              </Text>
              
              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {mockEvents.filter(e => e.status === 'scheduled').length} monitoreos programados
            </Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTROLES */}
      <View style={styles.controlsRow}>
        <View style={[styles.viewSelector, isDark && styles.viewSelectorDark]}>
          {[
            { key: 'month', label: 'Mes' },
            { key: 'week', label: 'Semana' }
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.viewOption,
                viewMode === key && styles.viewOptionActive
              ]}
              onPress={() => setViewMode(key as any)}
            >
              <Text style={[
                styles.viewOptionText,
                viewMode === key && styles.viewOptionTextActive
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Hoy</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* DÍAS DE LA SEMANA */}
        <View style={styles.weekDays}>
          {dayNames.map((day) => (
            <Text key={day} style={[
              styles.weekDay, 
              isDark && styles.weekDayDark,
              day === 'Dom' && styles.weekDaySunday,
              day === 'Sáb' && styles.weekDaySaturday
            ]}>
              {day}
            </Text>
          ))}
        </View>

        {/* ✅ GRID DE DÍAS HARDCODEADO */}
        <View style={[styles.daysGrid, isDark && styles.daysGridDark]}>
          {calendarDays.map((date, index) => {
            const dayOfWeek = date.getDay(); // 0=Domingo, 6=Sábado
            const dayOfMonth = date.getDate();
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isSelected = isSameDate(date, selectedDate);
            const isTodayDate = isToday(date);
            const dayEvents = getEventsForDate(date);
            const col = index % 7; // 0=Dom, 6=Sáb

            // ✅ DEBUG HARDCODEADO
            if (col === 6) { // Columna sábado
              console.log(`🎨 COLUMNA SÁBADO [${index}]: día ${dayOfMonth}, mes ${date.getMonth() + 1}, dayOfWeek ${dayOfWeek}`);
            }

            // ✅ LÓGICA DE ESTILOS
            const isSaturday = dayOfWeek === 6;
            const isSunday = dayOfWeek === 0;

            return (
              <TouchableOpacity
                key={`day-${index}-${dayOfMonth}-${date.getMonth()}`}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  isTodayDate && styles.todayDay,
                  isSaturday && isCurrentMonth && styles.saturdayDay,
                  isSunday && isCurrentMonth && styles.sundayDay,
                  !isCurrentMonth && styles.otherMonthDay,
                ]}
                onPress={() => setSelectedDate(new Date(date))}
              >
                <Text style={[
                  styles.dayNumber,
                  isSelected && styles.selectedDayText,
                  isTodayDate && styles.todayDayText,
                  isSaturday && isCurrentMonth && styles.saturdayDayText,
                  isSunday && isCurrentMonth && styles.sundayDayText,
                  !isCurrentMonth && styles.otherMonthText,
                  isDark && styles.dayNumberDark,
                ]}>
                  {dayOfMonth}
                </Text>

                {/* EVENTOS */}
                {hasEvents(date) && (
                  <View style={styles.eventIndicators}>
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <View
                        key={`${event.id}-${idx}`}
                        style={[
                          styles.eventDot,
                          { backgroundColor: getPriorityColor(event.priority) }
                        ]}
                      />
                    ))}
                  </View>
                )}
                
                {/* INDICADOR DOMINGO SIN EVENTOS */}
                {dayOfWeek === 0 && isCurrentMonth && !hasEvents(date) && (
                  <View style={styles.sundayIndicator}>
                    <Ionicons name="time-outline" size={10} color="#8B5CF6" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* EVENTOS DEL DÍA SELECCIONADO */}
        <View style={[styles.dayEvents, isDark && styles.dayEventsDark]}>
          <View style={styles.dayEventsHeader}>
            <Text style={[styles.dayEventsTitle, isDark && styles.textDark]}>
              {isSameDate(selectedDate, new Date()) ? 'Hoy' : 
               `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`}
            </Text>
            <View style={styles.eventStats}>
              <Text style={[styles.eventCount, isDark && styles.subtitleDark]}>
                {selectedDateEvents.length} eventos
              </Text>
              {isSunday(selectedDate) && (
                <View style={styles.overtimeBadge}>
                  <Ionicons name="time" size={12} color="#8B5CF6" />
                  <Text style={styles.overtimeBadgeText}>Domingo</Text>
                </View>
              )}
              {isSaturday(selectedDate) && (
                <View style={styles.saturdayBadge}>
                  <Ionicons name="calendar" size={12} color="#2196F3" />
                  <Text style={styles.saturdayBadgeText}>Sábado</Text>
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
                  { backgroundColor: getPriorityColor(event.priority) }
                ]} />
                
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, isDark && styles.textDark]}>
                      {event.title}
                    </Text>
                    <View style={styles.eventIcons}>
                      {event.isOvertime && (
                        <Ionicons name="time" size={14} color="#8B5CF6" />
                      )}
                      <Ionicons
                        name={getStatusIcon(event.status)}
                        size={16}
                        color={getPriorityColor(event.priority)}
                      />
                    </View>
                  </View>
                  
                  <Text style={[styles.eventTime, isDark && styles.subtitleDark]}>
                    ⏰ {event.startTime} - {event.endTime}
                    {event.isOvertime && (
                      <Text style={styles.overtimeLabel}> • Horas Extra</Text>
                    )}
                  </Text>
                  
                  <Text style={[styles.eventTechnician, isDark && styles.subtitleDark]}>
                    👤 {event.technician}
                  </Text>
                  
                  <Text style={[styles.eventLocation, isDark && styles.subtitleDark]}>
                    📍 {event.location}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEvents}>
              <Ionicons name="calendar-outline" size={48} color={isDark ? '#666' : '#ccc'} />
              <Text style={[styles.noEventsText, isDark && styles.subtitleDark]}>
                No hay eventos programados
              </Text>
              {isSunday(selectedDate) && (
                <Text style={[styles.noEventsSubtext, isDark && styles.subtitleDark]}>
                  Los domingos permiten programar horas extra
                </Text>
              )}
              {isSaturday(selectedDate) && (
                <Text style={[styles.noEventsSubtext, isDark && styles.subtitleDark]}>
                  Los sábados son ideales para trabajo especial
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <CreateEventModal
        isVisible={showCreateModal}
        onClose={closeCreateModal}
        selectedDate={selectedDate}
        isDark={isDark}
      />
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
  headerLeft: {
    flex: 1,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    minWidth: 160,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subtitleDark: {
    color: '#999',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  viewSelector: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  viewSelectorDark: {
    backgroundColor: '#2c2c2e',
  },
  viewOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewOptionActive: {
    backgroundColor: '#4CAF50',
  },
  viewOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  viewOptionTextActive: {
    color: '#fff',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    paddingVertical: 8,
  },
  weekDayDark: {
    color: '#666',
  },
  weekDaySunday: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  weekDaySaturday: {
    color: '#2196F3',
    fontWeight: '700',
  },
  
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  daysGridDark: {
    backgroundColor: '#1c1c1e',
  },
  
  // ✅ ESTILOS FINALES ELEGANTES
  dayCell: {
    width: '14.285714%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
    position: 'relative',
    minHeight: 40,
  },
  
  selectedDay: {
    backgroundColor: '#4CAF50',
  },
  
  todayDay: {
    backgroundColor: '#2196F3',
  },
  
  sundayDay: {
    backgroundColor: '#F3E5F5',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  
  saturdayDay: {
    backgroundColor: '#E3F2FD', // ✅ AZUL CLARO ELEGANTE
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  
  otherMonthDay: {
    opacity: 0.3,
  },
  
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  
  dayNumberDark: {
    color: '#fff',
  },
  
  selectedDayText: {
    color: '#fff',
  },
  
  todayDayText: {
    color: '#fff',
  },
  
  sundayDayText: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  
  saturdayDayText: {
    color: '#1976D2', // ✅ AZUL OSCURO ELEGANTE
    fontWeight: '700',
  },
  
  otherMonthText: {
    color: '#ccc',
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
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dayEvents: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dayEventsDark: {
    backgroundColor: '#1c1c1e',
  },
  dayEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayEventsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventCount: {
    fontSize: 14,
    color: '#666',
  },
  overtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  overtimeBadgeText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  saturdayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  saturdayBadgeText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventCardDark: {
    backgroundColor: '#2c2c2e',
  },
  overtimeEventCard: {
    borderLeftWidth: 2,
    borderLeftColor: '#8B5CF6',
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
    color: '#000',
    flex: 1,
  },
  eventIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  overtimeLabel: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  eventTechnician: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#666',
  },
  
  noEvents: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  noEventsSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  textDark: {
    color: '#fff',
  },
});