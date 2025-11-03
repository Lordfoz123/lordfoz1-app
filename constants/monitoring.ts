import { Ionicons } from '@expo/vector-icons';

export interface MatrixConfig {
  id: string;
  name: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  darkColor: string;
  lightBackground: string;
  description: string;
  parameters: string[];
}

export const MONITORING_MATRICES: Record<string, MatrixConfig> = {
  air: {
    id: 'air',
    name: 'Aire',
    color: '#2196F3',              // AZUL (antes era verde)
    icon: 'cloud-outline',
    darkColor: '#42A5F5',
    lightBackground: '#E3F2FD',
    description: 'Monitoreo de calidad del aire',
    parameters: ['PM2.5', 'PM10', 'CO2', 'SO2', 'NO2', 'O3', 'CO', 'VOCs'],
  },
  water: {
    id: 'water',
    name: 'Agua',
    color: '#00BCD4',              // CELESTE (antes era azul oscuro)
    icon: 'water-outline',
    darkColor: '#26C6DA',
    lightBackground: '#E0F7FA',
    description: 'Monitoreo de calidad del agua',
    parameters: ['pH', 'Turbidez', 'DBO', 'DQO', 'Coliformes', 'Metales pesados', 'Sólidos suspendidos'],
  },
  soil: {
    id: 'soil',
    name: 'Suelo',
    color: '#795548',
    icon: 'leaf-outline',
    darkColor: '#8D6E63',
    lightBackground: '#EFEBE9',
    description: 'Monitoreo de suelo',
    parameters: ['pH', 'Materia orgánica', 'Metales pesados', 'Hidrocarburos', 'Nutrientes'],
  },
  'occupational-health': {
    id: 'occupational-health',
    name: 'Salud Ocupacional',
    color: '#FF9800',
    icon: 'medkit-outline',
    darkColor: '#FFA726',
    lightBackground: '#FFF3E0',
    description: 'Monitoreo de salud ocupacional',
    parameters: ['Ruido', 'Iluminación', 'Temperatura', 'Ergonomía', 'EPPs', 'Ventilación'],
  },
};

export type MonitoringMatrix = keyof typeof MONITORING_MATRICES;

export const getMatrixConfig = (matrix: MonitoringMatrix): MatrixConfig => {
  return MONITORING_MATRICES[matrix];
};

export const getMatrixColor = (matrix: MonitoringMatrix): string => {
  return MONITORING_MATRICES[matrix].color;
};

export const getMatrixIcon = (matrix: MonitoringMatrix): keyof typeof Ionicons.glyphMap => {
  return MONITORING_MATRICES[matrix].icon;
};

export const getMatrixName = (matrix: MonitoringMatrix): string => {
  return MONITORING_MATRICES[matrix].name;
};

export const getAllMatrices = (): MatrixConfig[] => {
  return Object.values(MONITORING_MATRICES);
};