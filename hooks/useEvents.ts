import { useEffect, useState } from 'react';
// ✅ PATH CORRECTO basado en tu estructura
import { EventService } from '../services/eventService';
// ✅ IMPORT CORRECTO de MonitoringEvent  
import { MonitoringEvent } from '../services/firebase';

export const useEvents = () => {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 === INICIALIZANDO USEEVENTS HOOK ===');
    console.log('🔄 Timestamp:', new Date().toISOString());
    console.log('🔄 Usuario actual:', 'cymperu');
    setLoading(true);
    
    try {
      // ✅ Suscribirse a cambios en tiempo real
      console.log('🔄 Iniciando suscripción a EventService...');
      const unsubscribe = EventService.subscribeToEvents((newEvents) => {
        console.log('🔄 === EVENTOS ACTUALIZADOS EN HOOK ===');
        console.log('🔄 Número de eventos recibidos:', newEvents.length);
        console.log('🔄 Títulos de eventos:', newEvents.map(e => e.title));
        console.log('🔄 IDs de eventos:', newEvents.map(e => e.id));
        console.log('🔄 Fechas de eventos:', newEvents.map(e => e.date));
        console.log('🔄 Timestamp de actualización:', new Date().toISOString());
        
        setEvents(newEvents);
        setLoading(false);
        setError(null);
      });

      console.log('✅ Suscripción del hook creada exitosamente');

      // Limpiar suscripción al desmontar
      return () => {
        console.log('🔄 === CERRANDO SUSCRIPCIÓN DE EVENTOS ===');
        console.log('🔄 Timestamp de cierre:', new Date().toISOString());
        unsubscribe();
      };
    } catch (hookError) {
      console.error('❌ === ERROR EN USEEFFECT DEL HOOK ===');
      console.error('❌ Error:', hookError);
      console.error('❌ Timestamp:', new Date().toISOString());
      setError(hookError instanceof Error ? hookError.message : 'Error en hook');
      setLoading(false);
    }
  }, []);

  const createEvent = async (eventData: Omit<MonitoringEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 === HOOK: INICIANDO CREACIÓN DE EVENTO ===');
      console.log('🔄 Timestamp:', new Date().toISOString());
      console.log('🔄 Usuario:', 'cymperu');
      console.log('🔄 Datos del evento en hook:', JSON.stringify(eventData, null, 2));
      
      setError(null);
      
      console.log('🔄 Llamando a EventService.createEvent desde hook...');
      const eventId = await EventService.createEvent(eventData);
      
      console.log('✅ === HOOK: EVENTO CREADO EXITOSAMENTE ===');
      console.log('✅ ID del evento devuelto:', eventId);
      console.log('✅ Timestamp final:', new Date().toISOString());
      
      return eventId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando evento';
      console.error('❌ === ERROR EN HOOK CREATEEVENT ===');
      console.error('❌ Error completo:', err);
      console.error('❌ Mensaje de error:', errorMessage);
      console.error('❌ Stack trace:', err instanceof Error ? err.stack : 'No stack');
      console.error('❌ Timestamp del error:', new Date().toISOString());
      console.error('❌ Datos del evento que falló:', eventData);
      
      setError(errorMessage);
      throw err;
    }
  };

  const updateEvent = async (eventId: string, updateData: Partial<MonitoringEvent>) => {
    try {
      console.log('🔄 === HOOK: ACTUALIZANDO EVENTO ===');
      console.log('🔄 ID del evento:', eventId);
      console.log('🔄 Datos de actualización:', updateData);
      console.log('🔄 Timestamp:', new Date().toISOString());
      
      setError(null);
      await EventService.updateEvent(eventId, updateData);
      
      console.log('✅ Hook: Evento actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando evento';
      console.error('❌ Error en hook updateEvent:', errorMessage);
      console.error('❌ Error completo:', err);
      setError(errorMessage);
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      console.log('🔄 === HOOK: ELIMINANDO EVENTO ===');
      console.log('🔄 ID del evento a eliminar:', eventId);
      console.log('🔄 Timestamp:', new Date().toISOString());
      
      setError(null);
      await EventService.deleteEvent(eventId);
      
      console.log('✅ Hook: Evento eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando evento';
      console.error('❌ Error en hook deleteEvent:', errorMessage);
      console.error('❌ Error completo:', err);
      setError(errorMessage);
      throw err;
    }
  };

  // ✅ Función de debugging para el hook
  const debugHookState = () => {
    console.log('🐛 === DEBUG HOOK STATE ===');
    console.log('🐛 Número de eventos en estado:', events.length);
    console.log('🐛 Loading:', loading);
    console.log('🐛 Error:', error);
    console.log('🐛 Eventos actuales:', events.map(e => ({ 
      id: e.id, 
      title: e.title, 
      date: e.date 
    })));
    console.log('🐛 Timestamp:', new Date().toISOString());
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    debugHookState // ✅ Función adicional para debugging
  };
};