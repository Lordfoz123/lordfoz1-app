import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface CreateEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: Date;
  isDark: boolean;
}

interface NewEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  technician: string;
  matrix: string;
  priority: 'high' | 'medium' | 'low';
  location: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isVisible,
  onClose,
  selectedDate,
  isDark
}) => {
  const slideAnimation = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState<NewEvent>({
    title: '',
    description: '',
    startTime: '08:00',
    endTime: '10:00',
    technician: '',
    matrix: 'aire',
    priority: 'medium',
    location: ''
  });

  const technicians = [
    { id: 'tech001', name: 'Carlos Mendoza' },
    { id: 'tech002', name: 'Ana García' },
    { id: 'tech003', name: 'Luis Torres' },
    { id: 'tech004', name: 'María López' }
  ];

  const matrices = [
    { id: 'aire', name: 'Calidad de Aire', icon: 'cloud-outline' },
    { id: 'agua', name: 'Calidad de Agua', icon: 'water-outline' },
    { id: 'ruido', name: 'Ruido Ambiental', icon: 'volume-high-outline' },
    { id: 'suelo', name: 'Calidad de Suelo', icon: 'earth-outline' }
  ];

  const priorities = [
    { id: 'high', name: 'Alta', color: '#EF4444' },
    { id: 'medium', name: 'Media', color: '#F59E0B' },
    { id: 'low', name: 'Baja', color: '#10B981' }
  ];

  const formatSelectedDate = () => {
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = dayNames[selectedDate.getDay()];
    
    return `${dayName}, ${day} de ${monthNames[month]} ${year}`;
  };

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnimation, {
          toValue: 0,
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
    } else {
      Animated.parallel([
        Animated.spring(slideAnimation, {
          toValue: 400,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return false;
    }
    if (!formData.technician) {
      Alert.alert('Error', 'Debe seleccionar un técnico');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'La ubicación es obligatoria');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const newEvent = {
      ...formData,
      date: dateString,
      id: Date.now().toString(),
      status: 'scheduled',
      createdBy: 'cymperu',
      createdAt: new Date(),
      isOvertime: selectedDate.getDay() === 0 || selectedDate.getDay() === 6
    };

    console.log('💾 Guardando evento:', newEvent);

    Alert.alert(
      'Éxito',
      'Monitoreo programado correctamente',
      [{ text: 'OK', onPress: () => {
        setFormData({
          title: '',
          description: '',
          startTime: '08:00',
          endTime: '10:00',
          technician: '',
          matrix: 'aire',
          priority: 'medium',
          location: ''
        });
        onClose();
      }}]
    );
  };

  if (!isVisible) return null;

  return (
    <Modal transparent={true} visible={isVisible} animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContainer,
          isDark && styles.modalContainerDark,
          { transform: [{ translateY: slideAnimation }] }
        ]}
      >
        <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
          <View style={[styles.modalHandle, isDark && styles.modalHandleDark]} />
          <View style={styles.headerContent}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              Programar Monitoreo
            </Text>
            <Text style={[styles.modalSubtitle, isDark && styles.subtitleDark]}>
              {formatSelectedDate()}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, isDark && styles.closeButtonDark]}>
            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#666'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Título del Monitoreo *
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Ej: Calidad de Aire - Centro Lima"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Tipo de Matriz
            </Text>
            <View style={styles.optionsGrid}>
              {matrices.map((matrix) => (
                <TouchableOpacity
                  key={matrix.id}
                  style={[
                    styles.optionCard,
                    formData.matrix === matrix.id && styles.optionCardSelected,
                    isDark && styles.optionCardDark
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, matrix: matrix.id }))}
                >
                  <Ionicons
                    name={matrix.icon as any}
                    size={20}
                    color={formData.matrix === matrix.id ? '#4CAF50' : (isDark ? '#666' : '#999')}
                  />
                  <Text style={[
                    styles.optionText,
                    formData.matrix === matrix.id && styles.optionTextSelected,
                    isDark && styles.optionTextDark
                  ]}>
                    {matrix.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Horario
            </Text>
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, isDark && styles.labelDark]}>Inicio</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={formData.startTime}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: text }))}
                  placeholder="08:00"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, isDark && styles.labelDark]}>Fin</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={formData.endTime}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, endTime: text }))}
                  placeholder="10:00"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Técnico Asignado *
            </Text>
            <View style={styles.technicianGrid}>
              {technicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  style={[
                    styles.technicianCard,
                    formData.technician === tech.name && styles.technicianCardSelected,
                    isDark && styles.technicianCardDark
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, technician: tech.name }))}
                >
                  <View style={[
                    styles.technicianAvatar,
                    formData.technician === tech.name && styles.technicianAvatarSelected
                  ]}>
                    <Ionicons
                      name="person"
                      size={16}
                      color={formData.technician === tech.name ? '#fff' : '#999'}
                    />
                  </View>
                  <Text style={[
                    styles.technicianName,
                    formData.technician === tech.name && styles.technicianNameSelected,
                    isDark && styles.technicianNameDark
                  ]}>
                    {tech.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Prioridad
            </Text>
            <View style={styles.priorityRow}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority.id && [
                      styles.priorityButtonSelected,
                      { backgroundColor: priority.color + '20', borderColor: priority.color }
                    ],
                    isDark && styles.priorityButtonDark
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, priority: priority.id as any }))}
                >
                  <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                  <Text style={[
                    styles.priorityText,
                    formData.priority === priority.id && { color: priority.color },
                    isDark && styles.priorityTextDark
                  ]}>
                    {priority.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Ubicación *
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Ej: Plaza de Armas, Lima Centro"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Descripción (Opcional)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Detalles adicionales del monitoreo..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Programar</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  modalContainerDark: {
    backgroundColor: '#1c1c1e',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderDark: {
    borderBottomColor: '#333',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d0d0d0',
    marginBottom: 16,
  },
  modalHandleDark: {
    backgroundColor: '#666',
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  closeButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  labelDark: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  inputDark: {
    backgroundColor: '#2c2c2e',
    borderColor: '#444',
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  optionCardDark: {
    backgroundColor: '#2c2c2e',
    borderColor: '#444',
  },
  optionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5010',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  optionTextDark: {
    color: '#ccc',
  },
  optionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  technicianGrid: {
    gap: 8,
  },
  technicianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
  technicianCardDark: {
    backgroundColor: '#2c2c2e',
    borderColor: '#444',
  },
  technicianCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5010',
  },
  technicianAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  technicianAvatarSelected: {
    backgroundColor: '#4CAF50',
  },
  technicianName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  technicianNameDark: {
    color: '#ccc',
  },
  technicianNameSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    gap: 6,
    justifyContent: 'center',
  },
  priorityButtonDark: {
    backgroundColor: '#2c2c2e',
    borderColor: '#444',
  },
  priorityButtonSelected: {
    borderWidth: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  priorityTextDark: {
    color: '#ccc',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cancelButtonDark: {
    backgroundColor: '#2c2c2e',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelButtonTextDark: {
    color: '#ccc',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  textDark: {
    color: '#fff',
  },
  subtitleDark: {
    color: '#999',
  },
});