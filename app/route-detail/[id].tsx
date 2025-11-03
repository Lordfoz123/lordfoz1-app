import { db } from '@/services/firebase';
import { Route } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const routeDoc = await getDoc(doc(db, 'routes', id as string));
        if (routeDoc.exists()) {
          const data = routeDoc.data();
          setRoute({
            id: routeDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            scheduledDate: data.scheduledDate?.toDate(),
          } as Route);
        }
      } catch (error) {
        console.error('Error al cargar ruta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Cargando ruta...
        </Text>
      </View>
    );
  }

  if (!route) {
    return (
      <View style={[styles.errorContainer, isDark && styles.errorContainerDark]}>
        <Ionicons name="alert-circle-outline" size={64} color={isDark ? '#666' : '#ccc'} />
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Ruta no encontrada
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'pending': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Detalle de Ruta
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Información principal */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.routeName, isDark && styles.routeNameDark]}>
            {route.name}
          </Text>
          {route.description && (
            <Text style={[styles.description, isDark && styles.descriptionDark]}>
              {route.description}
            </Text>
          )}

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(route.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(route.status) }]}>
                {getStatusLabel(route.status)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(route.priority) + '20' }]}>
              <Text style={[styles.badgeText, { color: getPriorityColor(route.priority) }]}>
                Prioridad: {getPriorityLabel(route.priority)}
              </Text>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Estadísticas
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="location" size={24} color="#2196F3" />
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {route.completedPoints}/{route.totalPoints}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                Puntos
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="navigate" size={24} color="#4CAF50" />
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {route.totalDistance} km
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                Distancia
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#FF9800" />
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {route.estimatedTime} min
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                Tiempo est.
              </Text>
            </View>
          </View>

          {/* Progreso */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, isDark && styles.progressLabelDark]}>
                Progreso
              </Text>
              <Text style={[styles.progressPercentage, isDark && styles.progressPercentageDark]}>
                {Math.round((route.completedPoints / route.totalPoints) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(route.completedPoints / route.totalPoints) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Puntos de Monitoreo */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Puntos de Monitoreo ({route.monitoringPoints?.length || 0})
          </Text>

          {route.monitoringPoints && route.monitoringPoints.length > 0 ? (
            route.monitoringPoints.map((point) => (
              <View key={point.id} style={[styles.pointCard, isDark && styles.pointCardDark]}>
                <View style={styles.pointHeader}>
                  <View style={styles.pointLeft}>
                    <Text style={[styles.pointSequence, isDark && styles.pointSequenceDark]}>
                      #{point.sequence}
                    </Text>
                    <Text style={[styles.pointName, isDark && styles.pointNameDark]}>
                      {point.name}
                    </Text>
                  </View>
                  {point.status === 'completed' && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </View>
                <Text style={[styles.pointAddress, isDark && styles.pointAddressDark]}>
                  {point.address}
                </Text>
                {point.monitoringData?.parameters && (
                  <View style={styles.parametersContainer}>
                    <Text style={[styles.parametersLabel, isDark && styles.parametersLabelDark]}>
                      Parámetros:
                    </Text>
                    <Text style={[styles.parametersText, isDark && styles.parametersTextDark]}>
                      {point.monitoringData.parameters.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.noPointsText, isDark && styles.noPointsTextDark]}>
              No hay puntos de monitoreo
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  backIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerTitleDark: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
  },
  routeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  routeNameDark: {
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  descriptionDark: {
    color: '#999',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  cardTitleDark: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statValueDark: {
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statLabelDark: {
    color: '#999',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressLabelDark: {
    color: '#999',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressPercentageDark: {
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  pointCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pointCardDark: {
    backgroundColor: '#2c2c2e',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pointSequence: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  pointSequenceDark: {
    color: '#4CAF50',
  },
  pointName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  pointNameDark: {
    color: '#fff',
  },
  pointAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pointAddressDark: {
    color: '#999',
  },
  parametersContainer: {
    marginTop: 4,
  },
  parametersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  parametersLabelDark: {
    color: '#999',
  },
  parametersText: {
    fontSize: 12,
    color: '#666',
  },
  parametersTextDark: {
    color: '#999',
  },
  noPointsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noPointsTextDark: {
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingContainerDark: {
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  loadingTextDark: {
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorContainerDark: {
    backgroundColor: '#000',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 24,
  },
  errorTextDark: {
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});