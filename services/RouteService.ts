import { MonitoringPoint, Route, RouteStatus } from '@/types/route.types';
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QuerySnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

const ROUTES_COLLECTION = 'routes';

export class RouteService {
  /**
   * Listener en tiempo real para rutas de usuario
   */
  static getUserRoutes(
    userId: string,
    onUpdate: (routes: Route[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const routesQuery = query(
        collection(db, ROUTES_COLLECTION),
        where('assignedTo', '==', userId)
      );

      const unsubscribe = onSnapshot(
        routesQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const routes: Route[] = snapshot.docs.map(doc => {
            const data = doc.data();
            
            const monitoringPoints: MonitoringPoint[] = data.monitoringPoints?.map((point: any) => ({
              ...point,
              completedAt: point.completedAt?.toDate(),
            })) || [];

            return {
              id: doc.id,
              name: data.name || '',
              description: data.description,
              status: data.status || 'pending',
              priority: data.priority || 'medium',
              monitoringPoints,
              totalPoints: data.totalPoints || 0,
              completedPoints: data.completedPoints || 0,
              matrixStats: data.matrixStats,
              assignedTo: data.assignedTo || '',
              createdBy: data.createdBy || '',
              totalDistance: data.totalDistance || 0,
              estimatedTime: data.estimatedTime || 0,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              scheduledDate: data.scheduledDate?.toDate(),
            } as Route;
          });

          // Ordenar por fecha (más recientes primero)
          routes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          onUpdate(routes);
        },
        (error) => {
          console.error('Error al obtener rutas:', error);
          if (onError) {
            onError(error as Error);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error al configurar listener de rutas:', error);
      if (onError) {
        onError(error as Error);
      }
      return () => {};
    }
  }

  /**
   * Obtener rutas por estado (snapshot único)
   */
  static async getRoutesByStatus(userId: string, status: RouteStatus): Promise<Route[]> {
    try {
      const q = query(
        collection(db, ROUTES_COLLECTION),
        where('assignedTo', '==', userId),
        where('status', '==', status)
      );

      const querySnapshot = await getDocs(q);
      const routes: Route[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        const monitoringPoints: MonitoringPoint[] = data.monitoringPoints?.map((point: any) => ({
          ...point,
          completedAt: point.completedAt?.toDate(),
        })) || [];

        routes.push({
          id: doc.id,
          name: data.name || '',
          description: data.description,
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          monitoringPoints,
          totalPoints: data.totalPoints || 0,
          completedPoints: data.completedPoints || 0,
          matrixStats: data.matrixStats,
          assignedTo: data.assignedTo || '',
          createdBy: data.createdBy || '',
          totalDistance: data.totalDistance || 0,
          estimatedTime: data.estimatedTime || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          scheduledDate: data.scheduledDate?.toDate(),
        } as Route);
      });

      routes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return routes;
    } catch (error) {
      console.error('Error al obtener rutas por estado:', error);
      throw error;
    }
  }

  /**
   * Obtener una ruta específica
   */
  static async getRoute(routeId: string): Promise<Route | null> {
    try {
      const docRef = doc(db, ROUTES_COLLECTION, routeId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        const monitoringPoints: MonitoringPoint[] = data.monitoringPoints?.map((point: any) => ({
          ...point,
          completedAt: point.completedAt?.toDate(),
        })) || [];

        return {
          id: docSnap.id,
          name: data.name || '',
          description: data.description,
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          monitoringPoints,
          totalPoints: data.totalPoints || 0,
          completedPoints: data.completedPoints || 0,
          matrixStats: data.matrixStats,
          assignedTo: data.assignedTo || '',
          createdBy: data.createdBy || '',
          totalDistance: data.totalDistance || 0,
          estimatedTime: data.estimatedTime || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          scheduledDate: data.scheduledDate?.toDate(),
        } as Route;
      }

      return null;
    } catch (error) {
      console.error('Error al obtener ruta:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de ruta
   */
  static async updateRouteStatus(routeId: string, status: RouteStatus): Promise<void> {
    try {
      const docRef = doc(db, ROUTES_COLLECTION, routeId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Estado de ruta actualizado:', routeId, status);
    } catch (error) {
      console.error('Error al actualizar estado de ruta:', error);
      throw error;
    }
  }

  /**
   * Actualizar punto de monitoreo
   */
  static async updateMonitoringPoint(
    routeId: string,
    pointId: string,
    updates: Partial<MonitoringPoint>
  ): Promise<void> {
    try {
      const route = await this.getRoute(routeId);
      if (!route) throw new Error('Ruta no encontrada');

      const updatedPoints = route.monitoringPoints.map((point) => {
        if (point.id === pointId) {
          return {
            ...point,
            ...updates,
            completedAt: updates.status === 'completed' ? new Date() : point.completedAt,
          };
        }
        return point;
      });

      const completedPoints = updatedPoints.filter(p => p.status === 'completed').length;
      const allCompleted = completedPoints === updatedPoints.length;

      const docRef = doc(db, ROUTES_COLLECTION, routeId);
      await updateDoc(docRef, {
        monitoringPoints: updatedPoints.map(p => ({
          ...p,
          completedAt: p.completedAt ? Timestamp.fromDate(p.completedAt) : null,
        })),
        completedPoints,
        status: allCompleted ? 'completed' : route.status,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Punto de monitoreo actualizado:', pointId);
    } catch (error) {
      console.error('Error al actualizar punto de monitoreo:', error);
      throw error;
    }
  }

  /**
   * Iniciar ruta
   */
  static async startRoute(routeId: string): Promise<void> {
    await this.updateRouteStatus(routeId, 'in-progress');
  }

  /**
   * Completar ruta
   */
  static async completeRoute(routeId: string): Promise<void> {
    await this.updateRouteStatus(routeId, 'completed');
  }

  /**
   * Cancelar ruta
   */
  static async cancelRoute(routeId: string): Promise<void> {
    await this.updateRouteStatus(routeId, 'cancelled');
  }

  /**
   * Eliminar ruta
   */
  static async deleteRoute(routeId: string): Promise<void> {
    try {
      const docRef = doc(db, ROUTES_COLLECTION, routeId);
      await deleteDoc(docRef);
      console.log('✅ Ruta eliminada:', routeId);
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
      throw error;
    }
  }

  /**
   * Calcular distancia entre dos puntos (Haversine)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calcular distancia total de la ruta
   */
  static calculateTotalDistance(points: MonitoringPoint[]): number {
    if (points.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const distance = this.calculateDistance(
        points[i].location.latitude,
        points[i].location.longitude,
        points[i + 1].location.latitude,
        points[i + 1].location.longitude
      );
      totalDistance += distance;
    }

    return Math.round(totalDistance * 10) / 10;
  }

  /**
   * Estimar tiempo de viaje
   */
  static estimateTime(points: MonitoringPoint[]): number {
    const distance = this.calculateTotalDistance(points);
    const averageSpeed = 40; // km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    // Agregar 15 minutos por cada punto de monitoreo
    return timeInMinutes + (points.length * 15);
  }
}