import { getMatrixConfig } from '@/constants/monitoring';
import { MonitoringPoint } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface MonitoringPointCardProps {
  point: MonitoringPoint;
  onPress?: () => void;
  showSequence?: boolean;
}

export default function MonitoringPointCard({ 
  point, 
  onPress,
  showSequence = true 
}: MonitoringPointCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = getMatrixConfig(point.matrix);
  const isCompleted = point.status === 'completed';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'rgba(76, 175, 80, 0.1)';
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'skipped': return 'rgba(158, 158, 158, 0.1)';
      default: return '#f5f5f5';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'skipped': return 'Omitido';
      default: return status;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDark && styles.containerDark,
        isCompleted && styles.completedContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.matrixIndicator, { backgroundColor: config.color }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[
            styles.iconContainer, 
            { backgroundColor: config.lightBackground }
          ]}>
            <Ionicons name={config.icon} size={24} color={config.color} />
          </View>

          <View style={styles.headerText}>
            {showSequence && (
              <Text style={[styles.sequence, isDark && styles.sequenceDark]}>
                Punto {point.sequence}
              </Text>
            )}
            <Text style={[styles.name, isDark && styles.nameDark]}>
              {point.name}
            </Text>
            <View style={styles.matrixBadge}>
              <Text style={[styles.matrixText, { color: config.color }]}>
                {config.name}
              </Text>
            </View>
          </View>

          {isCompleted && (
            <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
          )}
        </View>

        <View style={styles.addressContainer}>
          <Ionicons 
            name="location-outline" 
            size={16} 
            color={isDark ? '#999' : '#666'} 
          />
          <Text 
            style={[styles.address, isDark && styles.addressDark]} 
            numberOfLines={2}
          >
            {point.address}
          </Text>
        </View>

        {point.monitoringData?.parameters && point.monitoringData.parameters.length > 0 && (
          <View style={styles.parametersContainer}>
            <Text style={[styles.parametersLabel, isDark && styles.parametersLabelDark]}>
              Parámetros:
            </Text>
            <View style={styles.parametersList}>
              {point.monitoringData.parameters.slice(0, 3).map((param, idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.parameterChip, 
                    { borderColor: config.color }
                  ]}
                >
                  <Text style={[styles.parameterText, { color: config.color }]}>
                    {param}
                  </Text>
                </View>
              ))}
              {point.monitoringData.parameters.length > 3 && (
                <Text style={[styles.moreParameters, isDark && styles.moreParametersDark]}>
                  +{point.monitoringData.parameters.length - 3} más
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(point.status) }]}>
            <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
              {getStatusLabel(point.status)}
            </Text>
          </View>

          {point.completedAt && (
            <Text style={[styles.completedTime, isDark && styles.completedTimeDark]}>
              {new Date(point.completedAt).toLocaleTimeString('es-PE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1c1c1e',
  },
  completedContainer: {
    opacity: 0.7,
  },
  matrixIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    padding: 16,
    paddingLeft: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  sequence: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  sequenceDark: {
    color: '#666',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  nameDark: {
    color: '#fff',
  },
  matrixBadge: {
    alignSelf: 'flex-start',
  },
  matrixText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressDark: {
    color: '#999',
  },
  parametersContainer: {
    marginBottom: 12,
  },
  parametersLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  parametersLabelDark: {
    color: '#666',
  },
  parametersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  parameterChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  parameterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreParameters: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
  },
  moreParametersDark: {
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  statusTextDark: {
    color: '#999',
  },
  completedTime: {
    fontSize: 12,
    color: '#999',
  },
  completedTimeDark: {
    color: '#666',
  },
});