import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

export default function ProfileScreen() {
  const { user, userName, userRole, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  // Obtener el nombre del usuario
  const displayName = userName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '';

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#121212' : '#f5f5f5'}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Header del Perfil */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View style={[styles.avatarContainer, isDark && styles.avatarContainerDark]}>
            <Ionicons name="person" size={60} color="#4CAF50" />
          </View>
          <Text style={[styles.userName, isDark && styles.textDark]}>{displayName}</Text>
          <Text style={[styles.userEmail, isDark && styles.textSecondaryDark]}>{email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userRole === 'admin' ? 'Administrador' : 'Trabajador'}</Text>
          </View>
        </View>

        {/* Opciones del Menú */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={[styles.menuItem, isDark && styles.menuItemDark]}>
            <Ionicons name="person-outline" size={24} color={isDark ? '#fff' : '#333'} />
            <Text style={[styles.menuText, isDark && styles.textDark]}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && styles.menuItemDark]}>
            <Ionicons name="notifications-outline" size={24} color={isDark ? '#fff' : '#333'} />
            <Text style={[styles.menuText, isDark && styles.textDark]}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && styles.menuItemDark]}>
            <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : '#333'} />
            <Text style={[styles.menuText, isDark && styles.textDark]}>Configuración</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, isDark && styles.menuItemDark]}>
            <Ionicons name="help-circle-outline" size={24} color={isDark ? '#fff' : '#333'} />
            <Text style={[styles.menuText, isDark && styles.textDark]}>Ayuda</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />
          </TouchableOpacity>
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity 
          style={[styles.signOutButton, isDark && styles.signOutButtonDark]} 
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainerDark: {
    backgroundColor: '#1a3a1a',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  roleBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  menuItemDark: {
    backgroundColor: '#1e1e1e',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  signOutButtonDark: {
    backgroundColor: '#1e1e1e',
  },
  signOutText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
    marginLeft: 8,
  },
});