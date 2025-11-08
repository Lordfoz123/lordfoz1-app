import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

// ✅ SOLO LOS ESTADOS QUE REALMENTE USAS EN TU APP
type PointStatus = 'pending' | 'completed';

interface MonitoringPointMarkerProps {
  status: PointStatus;
  number?: number;
  matrix?: string;
  showCount?: boolean;
}

// ✅ CONFIGURACIÓN LIMPIA - SOLO ESTADOS REALES
const MapPointColors: Record<PointStatus, {
  color: string;
  lightColor: string;
  animated: boolean;
  pulseSpeed?: number;
  showCheckmark: boolean;
  icon: string;
}> = {
  pending: {
    color: '#6B7280',
    lightColor: '#F3F4F6',
    animated: false, // ✅ SIN ANIMACIÓN PARA PENDIENTES
    showCheckmark: false,
    icon: 'ellipse',
  },
  completed: {
    color: '#10B981',
    lightColor: '#D1FAE5',
    animated: false, // ✅ SIN ANIMACIÓN PARA COMPLETADOS
    showCheckmark: true,
    icon: 'checkmark-circle',
  },
};

// ✅ COLORES POR MATRIZ (OPCIONAL)
const MatrixColors: Record<string, string> = {
  air: '#06B6D4',        // Cyan para Aire
  water: '#3B82F6',      // Blue para Agua  
  soil: '#84CC16',       // Lime para Suelo
  occupational: '#8B5CF6', // Purple para Salud Ocupacional
  noise: '#F59E0B',      // Amber para Ruido
  default: '#6B7280',    // Gray por defecto
};

export const MonitoringPointMarker: React.FC<MonitoringPointMarkerProps> = ({
  status,
  number,
  matrix = 'default',
  showCount = false,
}) => {
  const config = MapPointColors[status];
  const matrixColor = MatrixColors[matrix] || MatrixColors.default;
  
  // ✅ USAR COLOR DE MATRIZ SI NO ESTÁ COMPLETADO, VERDE SI ESTÁ COMPLETADO
  const pointColor = status === 'completed' ? config.color : matrixColor;
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // ✅ CANCELAR CUALQUIER ANIMACIÓN PREVIA
    cancelAnimation(scale);
    cancelAnimation(opacity);

    // ✅ COMO NINGÚN ESTADO ESTÁ ANIMADO, SIEMPRE VALORES FIJOS
    scale.value = 1;
    opacity.value = 0;
  }, [status]);

  // ✅ ESTILO DE ONDA (NO SE USA PORQUE NO HAY ANIMACIÓN)
  const animatedWaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }],
    opacity: 0,
  }));

  return (
    <View style={styles.container}>
      {/* ✅ NO HAY ONDA PORQUE NO HAY ANIMACIÓN */}
      
      {/* ✅ PUNTO PRINCIPAL SIEMPRE FIJO */}
      <View 
        style={[
          styles.point, 
          { backgroundColor: pointColor },
        ]}
      >
        {config.showCheckmark ? (
          // ✅ CHECK FIJO PARA COMPLETADOS
          <Ionicons name="checkmark" size={20} color="#FFF" />
        ) : (
          <>
            {/* ✅ MOSTRAR NÚMERO DEL PUNTO */}
            {number && !showCount && (
              <Text style={styles.numberText}>{number}</Text>
            )}
            {/* ✅ MOSTRAR CONTADOR GRUPAL */}
            {showCount && (
              <Text style={styles.countText}>+{number || 1}</Text>
            )}
            {/* ✅ ICONO POR DEFECTO SI NO HAY NÚMERO */}
            {!number && !showCount && (
              <Ionicons name="location" size={16} color="#FFF" />
            )}
          </>
        )}
      </View>

      {/* ✅ INDICADOR DE MATRIZ (OPCIONAL) */}
      {matrix !== 'default' && status !== 'completed' && (
        <View style={[styles.matrixIndicator, { backgroundColor: matrixColor }]}>
          <Text style={styles.matrixText}>{matrix.charAt(0).toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  point: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  matrixIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  matrixText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default MonitoringPointMarker;