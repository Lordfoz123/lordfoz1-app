/**
 * Sistema de diseño completo para la App de Monitoreo GPS
 * Colores corporativos: Verde Spotify
 * Con soporte para modo oscuro
 */

import { Platform } from 'react-native';

// Paleta de colores base
export const BaseColors = {
  // Verde Spotify - Principal
  primary: '#1DB954',
  primaryDark: '#1AA34A',
  primaryLight: '#1ED760',
  primaryPale: '#E8F5E9',

  // Estados de Puntos de Monitoreo
  pointPending: '#3B82F6',
  pointNext: '#F59E0B',
  pointCompleted: '#10B981',
  pointAlert: '#EF4444',
  pointInProgress: '#8B5CF6',
  pointInactive: '#9CA3AF',

  // Estados Generales
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// Colores por tema
export const LightTheme = {
  ...BaseColors,
  
  // Fondos
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',
  
  // Textos
  textPrimary: '#191414',
  textSecondary: '#535353',
  textTertiary: '#9CA3AF',
  
  // Glassmorphism
  glassBg: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  
  // Otros
  cardBg: '#FFFFFF',
  borderColor: '#E5E7EB',
  shadowColor: '#000',
};

export const DarkTheme = {
  ...BaseColors,
  
  // Fondos
  bgPrimary: '#0A0A0A',
  bgSecondary: '#141414',
  bgTertiary: '#1F1F1F',
  
  // Textos
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#6B7280',
  
  // Glassmorphism
  glassBg: 'rgba(20, 20, 20, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Otros
  cardBg: '#141414',
  borderColor: '#2A2A2A',
  shadowColor: '#000',
};

// Tipo para el tema
export type Theme = typeof LightTheme;

// Función para obtener colores según el tema
export const getColors = (isDark: boolean): Theme => {
  return isDark ? DarkTheme : LightTheme;
};

// Colores que no cambian con el tema (siempre iguales)
export const Colors = LightTheme; // Para compatibilidad con código existente

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Shadow = {
  sm: (isDark: boolean) => ({
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 2,
    elevation: 1,
  }),
  md: (isDark: boolean) => ({
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.07,
    shadowRadius: 6,
    elevation: 3,
  }),
  lg: (isDark: boolean) => ({
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDark ? 0.5 : 0.1,
    shadowRadius: 15,
    elevation: 5,
  }),
};

export const MapPointColors = {
  pending: {
    color: '#3B82F6',
    label: 'Pendiente',
    animated: false,
  },
  next: {
    color: '#F59E0B',
    label: 'Siguiente',
    animated: true,
    pulseSpeed: 2000,
  },
  completed: {
    color: '#10B981',
    label: 'Completado',
    animated: false,
    showCheckmark: true,
  },
  alert: {
    color: '#EF4444',
    label: 'Alerta',
    animated: true,
    pulseSpeed: 1000,
  },
  inProgress: {
    color: '#8B5CF6',
    label: 'En Progreso',
    animated: true,
    pulseSpeed: 1500,
  },
  inactive: {
    color: '#9CA3AF',
    label: 'No Disponible',
    animated: false,
  },
  userLocation: {
    color: '#1DB954',
    label: 'Tu Ubicación',
    animated: true,
    pulseSpeed: 2000,
    waves: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});