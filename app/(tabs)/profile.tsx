import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function ProfileScreen() {
  const { user, userName, userRole, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor(isDark ? '#121212' : '#f5f5f5');
    }
  }, [isDark]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          },
        },
      ]
    );
  };

  const displayName = userName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Espaciado superior (mismo que Home) */}
        <View style={styles.topSpacer} />

        {/* Card de perfil principal (mismo estilo que cards de Home) */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.card, isDark && styles.cardDark, styles.profileCard]}>
            {/* Avatar circular con letra */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{firstLetter}</Text>
            </View>

            {/* Información del usuario */}
            <Text style={[styles.userName, isDark && styles.textDark]}>{displayName}</Text>
            <Text style={[styles.userEmail, isDark && styles.textSecondaryDark]}>{user?.email}</Text>
            
            {/* Badge del rol */}
            <View style={[styles.roleBadge, isDark && styles.roleBadgeDark]}>
              <Ionicons 
                name={userRole === 'admin' ? 'shield-checkmark' : 'person'} 
                size={16} 
                color="#4CAF50" 
              />
              <Text style={styles.roleBadgeText}>
                {userRole === 'admin' ? 'Administrador' : 'Trabajador'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Estadísticas principales (mismo estilo que Home) */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>24</Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Días activo</Text>
          </View>

          <View style={[styles.statCard, styles.statCardBlue]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-done" size={32} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>156</Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Completados</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={32} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>48h</Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Tiempo</Text>
          </View>
        </View>

        {/* Card de distancia (igual que Home) */}
        <View style={[styles.distanceCard, isDark && styles.distanceCardDark]}>
          <View style={styles.distanceItem}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.distanceNumber}>342 km</Text>
            <Text style={[styles.distanceLabel, isDark && styles.textSecondaryDark]}>
              Recorridos Totales
            </Text>
          </View>

          <View style={[styles.distanceDivider, isDark && styles.distanceDividerDark]} />

          <View style={styles.distanceItem}>
            <Ionicons name="speedometer" size={24} color="#4CAF50" />
            <Text style={styles.distanceNumber}>14.2 km/h</Text>
            <Text style={[styles.distanceLabel, isDark && styles.textSecondaryDark]}>
              Velocidad Promedio
            </Text>
          </View>
        </View>

        {/* Card de información de cuenta */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#4CAF50" />
            <Text style={[styles.cardTitle, isDark && styles.textDark]}>
              Información de la Cuenta
            </Text>
          </View>

          <View style={[styles.infoItem, isDark && styles.borderDark]}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#999' : '#666'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, isDark && styles.textSecondaryDark]}>Email</Text>
              <Text style={[styles.infoValue, isDark && styles.textDark]}>{user?.email}</Text>
            </View>
          </View>

          <View style={[styles.infoItem, isDark && styles.borderDark]}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#999' : '#666'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, isDark && styles.textSecondaryDark]}>Usuario</Text>
              <Text style={[styles.infoValue, isDark && styles.textDark]}>{displayName}</Text>
            </View>
          </View>

          <View style={[styles.infoItem, isDark && styles.borderDark]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? '#999' : '#666'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, isDark && styles.textSecondaryDark]}>Rol</Text>
              <Text style={[styles.infoValue, isDark && styles.textDark]}>
                {userRole === 'admin' ? 'Administrador' : 'Trabajador'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="key-outline" size={20} color={isDark ? '#999' : '#666'} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, isDark && styles.textSecondaryDark]}>ID de usuario</Text>
              <Text style={[styles.infoValue, isDark && styles.textDark]} numberOfLines={1}>
                {user?.uid?.substring(0, 20)}...
              </Text>
            </View>
          </View>
        </View>

        {/* Card de configuración */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color="#4CAF50" />
            <Text style={[styles.cardTitle, isDark && styles.textDark]}>
              Configuración
            </Text>
          </View>

          <TouchableOpacity style={[styles.optionItem, isDark && styles.borderDark]}>
            <Ionicons name="notifications-outline" size={22} color="#4CAF50" />
            <Text style={[styles.optionText, isDark && styles.textDark]}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, isDark && styles.borderDark]}>
            <Ionicons name="lock-closed-outline" size={22} color="#4CAF50" />
            <Text style={[styles.optionText, isDark && styles.textDark]}>Privacidad y seguridad</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, isDark && styles.borderDark]}>
            <Ionicons name="language-outline" size={22} color="#4CAF50" />
            <Text style={[styles.optionText, isDark && styles.textDark]}>Idioma</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="information-circle-outline" size={22} color="#4CAF50" />
            <Text style={[styles.optionText, isDark && styles.textDark]}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#ccc'} />
          </TouchableOpacity>
        </View>

        {/* Botón de cerrar sesión (mismo estilo que Home) */}
        <TouchableOpacity
          style={[styles.trackingButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#fff" />
          <Text style={styles.trackingButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  topSpacer: {
    height: Platform.OS === 'ios' ? 50 : 20,
  },
  
  // Estilos de cards (iguales a Home)
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  
  // Card de perfil específico
  profileCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLetter: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleBadgeDark: {
    backgroundColor: '#1B5E20',
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  
  // Stats row (igual que Home)
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statCardBlue: {
    backgroundColor: '#E3F2FD',
  },
  statCardOrange: {
    backgroundColor: '#FFF3E0',
  },
  statCardGreen: {
    backgroundColor: '#E8F5E9',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  
  // Distance card (igual que Home)
  distanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceCardDark: {
    backgroundColor: '#1e1e1e',
  },
  distanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  distanceNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
    marginBottom: 4,
  },
  distanceLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  distanceDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  distanceDividerDark: {
    backgroundColor: '#333',
  },
  
  // Info items
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  borderDark: {
    borderBottomColor: '#333',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  
  // Options
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  
  // Tracking button (igual que Home)
  trackingButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    shadowColor: '#f44336',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});