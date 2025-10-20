import { auth, db, registerWithRestAPI } from '@/services/firebase';
import {
    User,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  userName: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  userName: null,
  login: async () => {},
  register: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    console.log('👂 Configurando listener de autenticación...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Estado de autenticación cambió:', firebaseUser ? firebaseUser.email : 'No autenticado');
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Obtener datos adicionales del usuario desde Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'worker');
            setUserName(userData.displayName || firebaseUser.displayName || firebaseUser.email);
            console.log('✅ Datos de usuario cargados:', userData.displayName);
          } else {
            console.log('⚠️ Documento de usuario no encontrado en Firestore');
            setUserRole('worker');
            setUserName(firebaseUser.displayName || firebaseUser.email);
          }
        } catch (error) {
          console.error('❌ Error al obtener datos del usuario:', error);
          setUserRole('worker');
          setUserName(firebaseUser.displayName || firebaseUser.email);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setUserName(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🆕 REGISTRO con REST API
  const register = async (email: string, password: string, displayName: string) => {
    try {
      console.log('🔐 Iniciando registro con REST API...');
      console.log('📧 Email:', email);
      console.log('👤 Nombre:', displayName);
      
      // Usar REST API para registrar
      const userData = await registerWithRestAPI(email, password);
      console.log('✅ Usuario creado con REST API');
      console.log('🆔 User ID:', userData.userId);

      // Crear documento en Firestore con el ID del usuario
      try {
        await setDoc(doc(db, 'users', userData.userId), {
          email: userData.email,
          displayName,
          createdAt: new Date().toISOString(),
          role: 'worker',
          userId: userData.userId,
        });
        console.log('✅ Documento de usuario creado en Firestore');
      } catch (firestoreError) {
        console.error('❌ Error al crear documento en Firestore:', firestoreError);
        // Continuar aunque falle Firestore
      }

      // Ahora hacer login automáticamente con el método normal de Firebase
      console.log('🔄 Iniciando sesión automáticamente...');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Sesión iniciada automáticamente');
      } catch (loginError: any) {
        console.error('⚠️ Error al iniciar sesión automática:', loginError);
        // Si falla el login automático, mostrar mensaje para que lo haga manualmente
        Alert.alert(
          '✅ Cuenta creada',
          'Tu cuenta se creó exitosamente. Por favor inicia sesión.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Error completo en registro:', error);
      console.error('Mensaje:', error.message);
      
      // Mensajes de error personalizados
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.message) {
        if (error.message.includes('EMAIL_EXISTS')) {
          errorMessage = 'Este email ya está registrado';
        } else if (error.message.includes('WEAK_PASSWORD')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (error.message.includes('INVALID_EMAIL')) {
          errorMessage = 'Email inválido';
        } else if (error.message.includes('TOO_MANY_ATTEMPTS')) {
          errorMessage = 'Demasiados intentos. Intenta más tarde';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  // LOGIN (método normal de Firebase)
  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Intentando login...');
      console.log('📧 Email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso:', userCredential.user.uid);
      
      // El listener de onAuthStateChanged se encargará de actualizar el estado
      
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
      
      // Mensajes de error personalizados
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Usuario deshabilitado';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      } else {
        errorMessage = error.message || 'Error al iniciar sesión';
      }
      
      throw new Error(errorMessage);
    }
  };

  // CERRAR SESIÓN
  const signOut = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await firebaseSignOut(auth);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    userRole,
    userName,
    login,
    register,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;