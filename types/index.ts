export type PointStatus = 'pending' | 'next' | 'completed' | 'alert' | 'inProgress' | 'inactive';

export interface MonitoringPoint {
  id: string;
  number: number;
  name: string;
  description?: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  status: PointStatus;
  assignedBy: 'admin' | 'analyst';
  createdAt: string;
  completedAt?: string;
  evidences?: Evidence[];
  notes?: string;
}

export interface Evidence {
  id: string;
  type: 'photo' | 'note';
  content: string;
  timestamp: string;
}

export interface Route {
  id: string;
  name: string;
  points: MonitoringPoint[];
  assignedBy: 'admin' | 'analyst';
  status: 'pending' | 'in-progress' | 'completed';
  totalDistance?: number;
  estimatedDuration?: number;
}

export interface WorkSchedule {
  id: string;
  analystId: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

export interface AnalystProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  schedule?: WorkSchedule;
  stats?: {
    totalKm: number;
    totalPoints: number;
    completionRate: number;
  };
}