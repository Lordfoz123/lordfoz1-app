import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcuR-wQo-WK140GjWl1O3aheCzpSSyaeM",
  authDomain: "gps-tracking-lordfoz.firebaseapp.com",
  projectId: "gps-tracking-lordfoz",
  storageBucket: "gps-tracking-lordfoz.firebasestorage.app",
  messagingSenderId: "4737521891",
  appId: "1:4737521891:web:f855e5494e37cf14cec7bc"
};

console.log('🔥 Inicializando Firebase para:', Platform.OS);

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore según plataforma
let db: Firestore;

if (Platform.OS === 'web') {
  // En web: configuración estándar
  console.log('🌐 Configurando Firestore para WEB');
  db = getFirestore(app);
  
} else {
  // En móvil (iOS/Android): configuración optimizada
  console.log('📱 Configurando Firestore para MÓVIL');
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
}

console.log('✅ Firebase inicializado correctamente para', Platform.OS);

export { app, db };
export default app;