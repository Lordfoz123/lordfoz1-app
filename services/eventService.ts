import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';
import { auth, COLLECTIONS, db, MonitoringEvent } from './firebase';

export class EventService {
  private static unsubscribeAuth: (() => void) | null = null;
  private static currentUser: any = null;

  static initialize() {
    if (this.unsubscribeAuth) return;

    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  static async createEvent(eventData: Omit<MonitoringEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!this.currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const now = new Date();
      const finalEventData = {
        ...eventData,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), finalEventData);

      // Verificación silenciosa
      const createdDocSnapshot = await getDoc(docRef);
      if (!createdDocSnapshot.exists()) {
        throw new Error('Error al confirmar la creación del evento');
      }

      return docRef.id;

    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  static async updateEvent(eventId: string, updateData: Partial<MonitoringEvent>): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const finalUpdateData = {
        ...updateData,
        updatedAt: new Date(),
      };

      await updateDoc(eventRef, finalUpdateData);

    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      await deleteDoc(eventRef);

    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }

  static subscribeToEvents(callback: (events: MonitoringEvent[]) => void): () => void {
    try {
      const q = query(
        collection(db, COLLECTIONS.EVENTS),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events: MonitoringEvent[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          events.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as MonitoringEvent);
        });

        callback(events);
      }, (error) => {
        console.error('Error en suscripción a eventos:', error);
        callback([]);
      });

      return unsubscribe;

    } catch (error) {
      console.error('Error al configurar suscripción:', error);
      return () => {};
    }
  }

  static cleanup() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    this.currentUser = null;
  }
}

// Inicializar automáticamente
EventService.initialize();