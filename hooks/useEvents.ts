import { useEffect, useState } from 'react';
import { EventService } from '../services/eventService';
// ✅ CORREGIR ESTA LÍNEA TAMBIÉN
import { MonitoringEvent } from '../firebase';

export const useEvents = () => {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Inicializando useEvents hook...');
    setLoading(true);
    
    // Suscribirse a cambios en tiempo real
    const unsubscribe = EventService.subscribeToEvents((newEvents) => {
      console.log('🔄 Eventos actualizados en hook:', newEvents.length);
      setEvents(newEvents);
      setLoading(false);
      setError(null);
    });

    // Limpiar suscripción al desmontar
    return () => {
      console.log('🔄 Cerrando suscripción de eventos');
      unsubscribe();
    };
  }, []);

  const createEvent = async (eventData: Omit<MonitoringEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      await EventService.createEvent(eventData);
      console.log('✅ Evento creado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando evento';
      console.error('❌ Error en createEvent:', errorMessage);
      setError(errorMessage);
    }
  };

  const updateEvent = async (eventId: string, updateData: Partial<MonitoringEvent>) => {
    try {
      setError(null);
      await EventService.updateEvent(eventId, updateData);
      console.log('✅ Evento actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando evento';
      console.error('❌ Error en updateEvent:', errorMessage);
      setError(errorMessage);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setError(null);
      await EventService.deleteEvent(eventId);
      console.log('✅ Evento eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando evento';
      console.error('❌ Error en deleteEvent:', errorMessage);
      setError(errorMessage);
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent
  };
};