import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleTabPress = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (Platform.OS === 'android') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Haptics no disponible');
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1c1c1e' : '#fff',
          borderTopWidth: 0.5,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
      }}
      screenListeners={{
        tabPress: () => {
          handleTabPress();
        },
      }}
    >
      {/* ✅ TAB 1: INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      {/* ✅ TAB 2: NAVEGAR */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Navegar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'navigate' : 'navigate-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      {/* ✅ TAB 3: PERFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person-circle' : 'person-circle-outline'} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      {/* ✅ PANTALLA OCULTA: Lista de rutas */}
      <Tabs.Screen
        name="routes"
        options={{
          href: null, // Oculto del tab bar
        }}
      />

      {/* ❌ REMOVIDO: route-detail ya no está aquí */}
    </Tabs>
  );
}