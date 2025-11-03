import { auth, db } from '@/services/firebase';
import {
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'worker';
  createdAt?: Date;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  login: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Función auxiliar para cargar datos del usuario
  const fetchUserData = async (authUser: User) => {
    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserData;
        setUserData(data);
        console.log('✅ Datos de usuario cargados:', JSON.stringify(data));
      } else {
        console.log('⚠️ No se encontró documento de usuario en Firestore');
        setUserData({
          name: authUser.displayName || 'Usuario',
          displayName: authUser.displayName || 'Usuario',
          email: authUser.email || '',
          photoURL: authUser.photoURL || '',
          role: 'worker',
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar datos del usuario:', error);
      setUserData({
        name: authUser.displayName || 'Usuario',
        displayName: authUser.displayName || 'Usuario',
        email: authUser.email || '',
        photoURL: authUser.photoURL || '',
        role: 'worker',
      });
    }
  };

  useEffect(() => {
    console.log('🟢 Configurando listener de autenticación...');
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        console.log('🟢 Estado de autenticación cambió: Autenticado');
        console.log('📧 Email:', authUser.email);
        
        setUser(authUser);
        await fetchUserData(authUser);
      } else {
        console.log('🟢 Estado de autenticación cambió: No autenticado');
        setUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return () => {
      console.log('🔴 Limpiando listener de autenticación');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando login...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso:', userCredential.user.email);
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'El correo electrónico no es válido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas';
          break;
        default:
          errorMessage = error.message || 'Error desconocido';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      console.log('🔴 Cerrando sesión...');
      await auth.signOut();
      setUser(null);
      setUserData(null);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Función para subir foto a Firebase Storage
  const uploadProfilePhoto = async (localUri: string): Promise<string> => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');

      console.log('📤 Subiendo foto a Firebase Storage...');

      const storage = getStorage();
      const filename = `profile_${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profile_photos/${filename}`);

      // Convertir URI local a blob
      const response = await fetch(localUri);
      const blob = await response.blob();

      // Subir a Firebase Storage
      await uploadBytes(storageRef, blob);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);

      console.log('✅ Foto subida exitosamente:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error al subir foto:', error);
      throw new Error('No se pudo subir la foto');
    }
  };

  // Función para actualizar perfil de usuario
  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }): Promise<boolean> => {
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      console.log('🔄 Actualizando perfil...', data);

      let photoURL = data.photoURL;

      // Si hay una nueva foto local, subirla a Firebase Storage
      if (data.photoURL && data.photoURL.startsWith('file://')) {
        photoURL = await uploadProfilePhoto(data.photoURL);
      }

      // Actualizar perfil en Firebase Auth
      await firebaseUpdateProfile(user, {
        displayName: data.displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
      });

      // Actualizar en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: data.displayName || user.displayName,
        displayName: data.displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
        updatedAt: new Date().toISOString(),
      });

      // Refrescar datos del usuario
      await fetchUserData(user);

      console.log('✅ Perfil actualizado exitosamente');

      return true;
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userData, 
        loading,
        login,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};