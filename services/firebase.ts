import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// 🔥 CONFIGURACIÓN DE FIREBASE
// Las credenciales están directamente aquí para que funcione sin problemas
const firebaseConfig = {
  apiKey: "AIzaSyAcnldObgeNJoeetWA2TouyXl0zzsq5k_0",
  authDomain: "gps-tracking-lordfoz.firebaseapp.com",
  projectId: "gps-tracking-lordfoz",
  storageBucket: "gps-tracking-lordfoz.firebasestorage.app",
  messagingSenderId: "4737521891",
  appId: "1:4737521891:web:f855e5494e37cf14cec7bc"
};

console.log('🔥 Inicializando Firebase para:', Platform.OS);
console.log('📦 Project ID:', firebaseConfig.projectId);

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);

// Inicializar Firestore según plataforma
let db;
if (Platform.OS === 'web') {
  console.log('🌐 Configurando Firestore para WEB');
  db = getFirestore(app);
} else {
  console.log('📱 Configurando Firestore para MÓVIL');
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
}

// Inicializar Auth
console.log('🔐 Inicializando Auth...');
const auth = getAuth(app);

// Inicializar Storage
const storage = getStorage(app);

console.log('✅ Firebase inicializado correctamente');
console.log('✅ Auth:', auth ? 'OK' : 'ERROR');
console.log('✅ Firestore:', db ? 'OK' : 'ERROR');
console.log('✅ Storage:', storage ? 'OK' : 'ERROR');

// 🆕 MÉTODO ALTERNATIVO: Registro usando REST API de Firebase
export const registerWithRestAPI = async (email: string, password: string) => {
  const API_KEY = firebaseConfig.apiKey;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
  
  console.log('🌐 Intentando registro con REST API...');
  console.log('📧 Email:', email);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error REST API:', data.error);
      throw new Error(data.error.message);
    }

    console.log('✅ Usuario creado con REST API');
    console.log('🆔 User ID:', data.localId);
    
    return {
      userId: data.localId,
      email: data.email,
      idToken: data.idToken,
      refreshToken: data.refreshToken,
    };
  } catch (error: any) {
    console.error('❌ Error en REST API:', error);
    throw error;
  }
};

// 🆕 MÉTODO ALTERNATIVO: Login usando REST API de Firebase
export const loginWithRestAPI = async (email: string, password: string) => {
  const API_KEY = firebaseConfig.apiKey;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  
  console.log('🌐 Intentando login con REST API...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error REST API:', data.error);
      throw new Error(data.error.message);
    }

    console.log('✅ Login exitoso con REST API');
    console.log('🆔 User ID:', data.localId);
    
    return {
      userId: data.localId,
      email: data.email,
      idToken: data.idToken,
      refreshToken: data.refreshToken,
    };
  } catch (error: any) {
    console.error('❌ Error en login REST API:', error);
    throw error;
  }
};

export { app, auth, db, firebaseConfig, storage };
export default app;