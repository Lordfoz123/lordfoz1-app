import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export type StopReasonKey =
  | 'break'
  | 'end_of_shift'
  | 'battery_low'
  | 'network_issue'
  | 'device_heat'
  | 'manual_pause'
  | 'other';

export const DEFAULT_REASONS: { key: StopReasonKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'break', label: 'Descanso', icon: 'cafe' },
  { key: 'end_of_shift', label: 'Fin de turno', icon: 'checkmark-done' },
  { key: 'battery_low', label: 'Batería baja', icon: 'battery-dead' },
  { key: 'network_issue', label: 'Sin señal / red', icon: 'wifi' },
  { key: 'device_heat', label: 'Temperatura del dispositivo', icon: 'thermometer' },
  { key: 'manual_pause', label: 'Pausa manual', icon: 'pause' },
  { key: 'other', label: 'Otro', icon: 'ellipsis-horizontal' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: StopReasonKey, note?: string) => void;
  reasons?: typeof DEFAULT_REASONS;
};

export default function StopTrackingSheet({ visible, onClose, onConfirm, reasons = DEFAULT_REASONS }: Props) {
  const [selected, setSelected] = useState<StopReasonKey>('manual_pause');
  const [note, setNote] = useState('');
  const slide = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slide, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      slide.setValue(0);
      setSelected('manual_pause');
      setNote('');
    }
  }, [visible]);

  const translateY = useMemo(
    () => slide.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }),
    [slide]
  );
  const opacity = slide;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }], opacity }]}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="stop-circle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.headerTitle}>¿Por qué detienes el servicio?</Text>
          </View>

          <View style={styles.grid}>
            {reasons.map((r) => {
              const isSel = selected === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.reasonItem, isSel && styles.reasonItemSelected]}
                  onPress={() => setSelected(r.key)}
                >
                  <Ionicons
                    name={r.icon}
                    size={20}
                    color={isSel ? '#fff' : '#4B5563'}
                    style={styles.reasonIcon}
                  />
                  <Text style={[styles.reasonLabel, isSel && styles.reasonLabelSelected]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.noteBox}>
            <Ionicons name="create-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Comentario opcional…"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              style={styles.input}
              multiline
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onConfirm(selected, note.trim() || undefined);
                onClose();
              }}
            >
              <Ionicons name="send" size={16} color="#fff" />
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'ios' && <View style={{ height: 8 }} />}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  backdrop: { flex: 1 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  reasonItemSelected: { backgroundColor: '#10B981', borderColor: '#10B981' },
  reasonIcon: {},
  reasonLabel: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  reasonLabelSelected: { color: '#fff' },

  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 14, color: '#111827' },

  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: { color: '#111827', fontSize: 14, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});