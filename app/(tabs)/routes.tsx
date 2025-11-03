import { useAuth } from '@/contexts/AuthContext';
import { useRoutes } from '@/hooks/useRoutes';
import { seedRoutes } from '@/scripts/seedRoutes';
import { Route } from '@/types/route.types';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

export default function RoutesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const { routes, loading, error, refresh } = useRoutes();
  const [refreshing, setRefreshing] = useState(false);

  // Animaciones
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const smallTitleOpacity = scrollY.interpolate({
    inputRange: [40, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerBlurOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Función para sembrar rutas de prueba
  const handleSeedRoutes = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión');
      return;
    }

    Alert.alert(
      'Crear rutas de prueba',
      '¿Quieres crear 5 rutas de ejemplo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            try {
              const success = await seedRoutes(user.uid);
              if (success) {
                Alert.alert('Éxito', 'Rutas creadas correctamente');
                refresh();
              } else {
                Alert.alert('Error', 'No se pudieron crear las rutas');
              }
            } catch (err) {
              Alert.alert('Error', 'Ocurrió un error al crear las rutas');
            }
          },
        },
      ]
    );
  };

  // Filtrar rutas
  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'pending': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En progreso';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  // ✅ Navegar al detalle de la ruta
  const handleRoutePress = (route: Route) => {
    router.push(`/route-detail/${route.id}`);

  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />

      {/* Header con blur */}
      <Animated.View 
        style={[styles.headerWrapper, { opacity: headerBlurOpacity }]}
      >
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.header, isDark ? styles.headerBlur : styles.headerBlurLight]}
        >
          <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
          <Animated.View style={[styles.smallTitleContainer, { opacity: smallTitleOpacity }]}>
            <Text style={[styles.smallTitle, isDark && styles.textDark]}>Rutas</Text>
          </Animated.View>
        </BlurView>
      </Animated.View>

      {/* Scroll */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor={isDark ? '#fff' : '#000'} 
          />
        }
      >
        {/* Título y buscador */}
        <View style={styles.titleSection}>
          <Animated.View style={{ opacity: titleOpacity }}>
            <Text style={[styles.largeTitle, isDark && styles.textDark]}>Rutas</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.searchContainer, 
              isDark && styles.searchContainerDark, 
              { opacity: searchBarOpacity }
            ]}
          >
            <Ionicons name="search" size={20} color={isDark ? '#8E8E93' : '#666'} />
            <TextInput
              style={[styles.searchInput, isDark && styles.searchInputDark]}
              placeholder="Buscar rutas..."
              placeholderTextColor={isDark ? '#8E8E93' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDark ? '#8E8E93' : '#666'} />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        <View style={{ height: 16 }} />

        {/* Loading */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
              Cargando rutas...
            </Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={48} color="#f44336" />
            <Text style={[styles.errorText, isDark && styles.textDark]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty con botón para crear rutas de prueba */}
        {!loading && !error && filteredRoutes.length === 0 && (
          <View style={styles.centerContainer}>
            <Ionicons name="map-outline" size={64} color={isDark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, isDark && styles.textDark]}>
              {searchQuery ? 'No se encontraron rutas' : 'No tienes rutas asignadas'}
            </Text>
            
            {/* Botón para crear rutas de prueba */}
            {!searchQuery && (
              <TouchableOpacity
                style={styles.seedButton}
                onPress={handleSeedRoutes}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.seedButtonText}>
                  Crear rutas de prueba
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Lista de rutas */}
        {!loading && !error && filteredRoutes.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[styles.card, isDark && styles.cardDark]}
            onPress={() => handleRoutePress(route)}
            activeOpacity={0.7}
          >
            <View style={styles.routeItem}>
              <View 
                style={[
                  styles.routeIconContainer, 
                  { backgroundColor: getStatusColor(route.status) + '20' }
                ]}
              >
                <Ionicons 
                  name={
                    route.status === 'completed' ? 'checkmark-circle' :
                    route.status === 'in-progress' ? 'navigate' :
                    'ellipse-outline'
                  } 
                  size={24} 
                  color={getStatusColor(route.status)} 
                />
              </View>
              
              <View style={styles.routeInfo}>
                <View style={styles.routeHeader}>
                  <Text style={[styles.routeTitle, isDark && styles.textDark]}>
                    {route.name}
                  </Text>
                  <View 
                    style={[
                      styles.priorityBadge, 
                      { backgroundColor: getPriorityColor(route.priority) }
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {getPriorityText(route.priority)}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.routeSubtitle, isDark && styles.textSecondaryDark]}>
                  {route.completedPoints} de {route.totalPoints} puntos • {route.totalDistance} km
                </Text>
                
                <View style={styles.statusContainer}>
                  <View 
                    style={[
                      styles.statusDot, 
                      { backgroundColor: getStatusColor(route.status) }
                    ]} 
                  />
                  <Text style={[styles.statusText, isDark && styles.textSecondaryDark]}>
                    {getStatusText(route.status)}
                  </Text>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#444' : '#ccc'} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
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
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    zIndex: 10,
  },
  headerBlur: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBlurLight: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  smallTitleContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  smallTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchContainerDark: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  searchInputDark: {
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#000',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#000',
    marginTop: 12,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  seedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  routeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  routeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  routeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#666',
  },
});