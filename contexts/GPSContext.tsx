import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import GPSService from '../services/GPSService';

export interface GPSContextType {
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  currentUserId: string | null;
  startTracking: (userId?: string) => Promise<boolean>;
  stopTracking: () => Promise<void>;
  clearError: () => void;
}

const GPSContext = createContext<GPSContextType | null>(null);

export const GPSProvider = ({ children }: { children: ReactNode }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeGPS = async () => {
      try {
        setIsLoading(true);
        const tracking = await GPSService.isTracking();
        setIsTracking(tracking);
        setLastUpdate(Date.now());
        console.log('🔄 GPS Context initialized - isTracking:', tracking);
      } catch (err) {
        console.error('❌ Error initializing GPS Context:', err);
        setError(err instanceof Error ? err.message : 'Error al inicializar GPS');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGPS();
  }, []);

  const startTracking = async (userId: string = 'cymperu'): Promise<boolean> => {
    try {
      console.log('🚀 Starting GPS tracking for user:', userId);
      setIsLoading(true);
      setError(null);
      
      await GPSService.startTracking(userId);
      
      setIsTracking(true);
      setCurrentUserId(userId);
      setLastUpdate(Date.now());
      
      console.log('✅ GPS tracking started successfully');
      return true;
    } catch (err) {
      console.error('❌ Error starting GPS tracking:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar tracking GPS');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = async (): Promise<void> => {
    try {
      console.log('🛑 Stopping GPS tracking');
      setIsLoading(true);
      setError(null);
      
      await GPSService.stopTracking();
      
      setIsTracking(false);
      setCurrentUserId(null);
      setLastUpdate(Date.now());
      
      console.log('✅ GPS tracking stopped successfully');
    } catch (err) {
      console.error('❌ Error stopping GPS tracking:', err);
      setError(err instanceof Error ? err.message : 'Error al detener tracking GPS');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: GPSContextType = {
    isTracking,
    isLoading,
    error,
    lastUpdate,
    currentUserId,
    startTracking,
    stopTracking,
    clearError,
  };

  return (
    <GPSContext.Provider value={value}>
      {children}
    </GPSContext.Provider>
  );
};

export const useGPS = () => {
  const context = useContext(GPSContext);
  if (!context) {
    throw new Error('useGPS must be used within a GPSProvider. Wrap your app with <GPSProvider>');
  }
  return context;
};