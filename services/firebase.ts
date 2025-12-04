import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcuR-wQo_wKl4GQjWIiO3aheCzp5SyaeM",
  authDomain: "gps-tracking-lordfoz.firebaseapp.com",
  projectId: "gps-tracking-lordfoz",
  storageBucket: "gps-tracking-lordfoz.firebasestorage.app",
  messagingSenderId: "47375221891",
  appId: "1:47375221891:web:f855e5494e37cf14cec7b6"
};

console.log('🔥 Inicializando Firebase...');

// ✅ Inicializar Firebase SOLO UNA VEZ
const app = initializeApp(firebaseConfig);

// ✅ Inicializar Auth con persistencia de AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// ✅ Inicializar Firestore
const db = getFirestore(app);

// ✅ Inicializar Storage
const storage = getStorage(app);

console.log('✅ Firebase inicializado correctamente');
console.log('📦 Project ID:', firebaseConfig.projectId);

// ✅ Constantes para las colecciones
export const COLLECTIONS = {
  EVENTS: 'events',
  USERS: 'users',
  LOCATIONS: 'locations',
  ROUTES: 'routes'
};

// ✅ Interface para MonitoringEvent
export interface MonitoringEvent {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  description?: string;
  location?: string;
  type?: 'monitoring' | 'maintenance' | 'inspection';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ✅ Exportar todo lo necesario
export { auth, db, storage };
export default app;