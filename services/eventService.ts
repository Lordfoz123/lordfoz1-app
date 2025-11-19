import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { COLLECTIONS, db, MonitoringEvent } from '../firebase';

export class EventService {
  
  // ✅ Crear nuevo evento
  static async createEvent(eventData: Omit<MonitoringEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('📝 Creando evento:', eventData);
      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
        ...eventData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ Evento creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      throw error;
    }
  }

  // ✅ Escuchar cambios en tiempo real
  static subscribeToEvents(callback: (events: MonitoringEvent[]) => void) {
    console.log('🔄 Iniciando suscripción en tiempo real...');
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const events: MonitoringEvent[] = [];
      querySnapshot.forEach((docSnapshot) => {
        events.push({ id: docSnapshot.id, ...docSnapshot.data() } as MonitoringEvent);
      });
      console.log(`🔄 Eventos actualizados: ${events.length} eventos`);
      callback(events);
    }, (error) => {
      console.error('❌ Error en suscripción a eventos:', error);
    });
  }

  // ✅ Actualizar evento
  static async updateEvent(eventId: string, updateData: Partial<MonitoringEvent>): Promise<void> {
    try {
      console.log('📝 Actualizando evento:', eventId);
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      await updateDoc(eventRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Evento actualizado');
    } catch (error) {
      console.error('❌ Error actualizando evento:', error);
      throw error;
    }
  }

  // ✅ Eliminar evento
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando evento:', eventId);
      await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
      console.log('✅ Evento eliminado');
    } catch (error) {
      console.error('❌ Error eliminando evento:', error);
      throw error;
    }
  }

  // ✅ Obtener todos los eventos
  static async getAllEvents(): Promise<MonitoringEvent[]> {
    try {
      console.log('📊 Obteniendo todos los eventos...');
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.EVENTS),
          orderBy('date', 'asc'),
          orderBy('startTime', 'asc')
        )
      );
      
      const events: MonitoringEvent[] = [];
      querySnapshot.forEach((docSnapshot) => {
        events.push({ id: docSnapshot.id, ...docSnapshot.data() } as MonitoringEvent);
      });
      
      console.log(`✅ ${events.length} eventos obtenidos`);
      return events;
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error);
      throw error;
    }
  }
}