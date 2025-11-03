// Tipo de matriz de monitoreo
export type MonitoringMatrix = 'air' | 'water' | 'soil' | 'occupational-health';

// Estado del punto
export type PointStatus = 'pending' | 'completed' | 'skipped';

// Punto de monitoreo
export interface MonitoringPoint {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  matrix: MonitoringMatrix;
  status: PointStatus;
  sequence: number;
  
  // Datos específicos del monitoreo
  monitoringData?: {
    parameters?: string[];
    equipment?: string;
    sampleId?: string;
    observations?: string;
  };
  
  // Evidencias
  photos?: string[];
  signature?: string;
  completedAt?: Date;
  completedBy?: string;
}

// Estado de la ruta
export type RouteStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// Prioridad de la ruta
export type RoutePriority = 'low' | 'medium' | 'high';

// Ruta completa
export interface Route {
  id: string;
  name: string;
  description?: string;
  status: RouteStatus;
  priority: RoutePriority;
  
  // Puntos de monitoreo
  monitoringPoints: MonitoringPoint[];
  totalPoints: number;
  completedPoints: number;
  
  // Estadísticas por matriz
  matrixStats?: {
    air: number;
    water: number;
    soil: number;
    'occupational-health': number;
  };
  
  assignedTo: string;
  createdBy: string;
  totalDistance: number;
  estimatedTime: number;
  
  createdAt: Date;
  updatedAt: Date;
  scheduledDate?: Date;
}