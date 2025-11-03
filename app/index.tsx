import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function InitialScreen() {
  const { user, loading } = useAuth();

  // Mientras carga, mostrar splash
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Logo/Icono grande */}
        <View style={styles.logoContainer}>
          <Ionicons name="location" size={80} color="#4CAF50" />
        </View>
        
        {/* Nombre de la app */}
        <Text style={styles.title}>GPS Tracking</Text>
        <Text style={styles.subtitle}>Gestión de Rutas</Text>
        
        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
        
        {/* Footer opcional */}
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    );
  }

  // Una vez verificado, redirigir automáticamente
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: '#ccc',
  },
});