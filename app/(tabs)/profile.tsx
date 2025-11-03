import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, userData, signOut, updateUserProfile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Animaciones
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const smallTitleOpacity = scrollY.interpolate({
    inputRange: [40, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerBlurOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await signOut();
              router.replace('/(auth)');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo cerrar sesión');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const displayName = userData?.displayName || userData?.name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || 'correo@ejemplo.com';

  // Abrir modal de edición
  const handleOpenEditModal = () => {
    setEditName(displayName);
    setEditEmail(userEmail);
    setEditPhoto(user?.photoURL || null);
    setShowEditModal(true);
  };

  // Seleccionar imagen (SIN WARNING)
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,  // ✅ CORRECTO
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('📸 Imagen seleccionada:', result.assets[0].uri);
        setEditPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Tomar foto (SIN WARNING)
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('📸 Foto tomada:', result.assets[0].uri);
        setEditPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Opciones de foto
  const handlePhotoOptions = () => {
    Alert.alert(
      'Foto de perfil',
      'Elige una opción',
      [
        {
          text: 'Tomar foto',
          onPress: handleTakePhoto,
        },
        {
          text: 'Elegir de galería',
          onPress: handlePickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Guardar cambios (CON FIREBASE REAL) ✅
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Iniciando guardado de perfil...');
      console.log('📝 Nombre:', editName);
      console.log('📸 Foto:', editPhoto);
      
      // Guardar en Firebase
      await updateUserProfile({
        displayName: editName,
        photoURL: editPhoto || undefined,
      });
      
      console.log('✅ Perfil guardado exitosamente');
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setShowEditModal(false);
      
    } catch (error: any) {
      console.error('❌ Error al guardar perfil:', error);
      console.error('❌ Stack:', error.stack);
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  // Opciones de menú
  const menuOptions = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      title: 'Notificaciones',
      onPress: () => Alert.alert('Notificaciones', 'Configuración de notificaciones'),
    },
    {
      id: 'privacy',
      icon: 'lock-closed-outline',
      title: 'Privacidad',
      onPress: () => Alert.alert('Privacidad', 'Configuración de privacidad'),
    },
    {
      id: 'security',
      icon: 'shield-checkmark-outline',
      title: 'Seguridad',
      onPress: () => Alert.alert('Seguridad', 'Configuración de seguridad'),
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      title: 'Ayuda',
      onPress: () => Alert.alert('Ayuda', 'Centro de ayuda'),
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      title: 'Acerca de',
      onPress: () => Alert.alert('Acerca de', 'Versión 1.0.0'),
    },
  ];

  // Filtrar opciones según búsqueda
  const filteredOptions = menuOptions.filter(option =>
    option.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />

      {/* Header con blur */}
      <Animated.View style={[styles.headerWrapper, { opacity: headerBlurOpacity }]}>
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.header, isDark ? styles.headerBlur : styles.headerBlurLight]}
        >
          <View style={{ height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40 }} />
          <Animated.View style={[styles.smallTitleContainer, { opacity: smallTitleOpacity }]}>
            <Text style={[styles.smallTitle, isDark && styles.textDark]}>Perfil</Text>
          </Animated.View>
        </BlurView>
      </Animated.View>

      {/* Contenido con scroll */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Título y buscador */}
        <View style={styles.titleSection}>
          <Animated.View style={{ opacity: titleOpacity }}>
            <Text style={[styles.largeTitle, isDark && styles.textDark]}>Perfil</Text>
          </Animated.View>

          <Animated.View style={[styles.searchContainer, isDark && styles.searchContainerDark, { opacity: searchBarOpacity }]}>
            <Ionicons name="search" size={20} color={isDark ? '#8E8E93' : '#666'} />
            <TextInput
              style={[styles.searchInput, isDark && styles.searchInputDark]}
              placeholder="Buscar en perfil..."
              placeholderTextColor={isDark ? '#8E8E93' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDark ? '#8E8E93' : '#999'} />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        <View style={{ height: 16 }} />

        {/* Card de perfil */}
        <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, isDark && styles.textDark]}>{displayName}</Text>
              <Text style={[styles.userEmail, isDark && styles.textSecondaryDark]}>{userEmail}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleOpenEditModal}>
            <Ionicons name="create-outline" size={20} color="#4CAF50" />
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Opciones */}
        {filteredOptions.length > 0 ? (
          <View style={[styles.menuCard, isDark && styles.menuCardDark]}>
            {filteredOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuItem,
                  index < filteredOptions.length - 1 && styles.menuItemBorder,
                  isDark && styles.menuItemBorderDark,
                ]}
                onPress={option.onPress}
              >
                <Ionicons name={option.icon as any} size={24} color={isDark ? '#999' : '#666'} />
                <Text style={[styles.menuText, isDark && styles.textDark]}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#444' : '#ccc'} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptySearchContainer}>
            <Ionicons name="search-outline" size={48} color={isDark ? '#444' : '#ccc'} />
            <Text style={[styles.emptySearchText, isDark && styles.textSecondaryDark]}>
              No se encontraron resultados para "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Botón cerrar sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, isDark && styles.logoutButtonDark, loggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#f44336" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color="#f44336" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* MODAL EDITAR PERFIL */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, isDark && styles.modalContainerDark]}
        >
          <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={[styles.modalCancel, isDark && styles.textDark]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
              <Text style={[styles.modalSave, saving && styles.modalSaveDisabled]}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Foto de perfil */}
            <TouchableOpacity style={styles.photoSection} onPress={handlePhotoOptions}>
              {editPhoto ? (
                <Image source={{ uri: editPhoto }} style={styles.editAvatar} />
              ) : (
                <View style={styles.editAvatarPlaceholder}>
                  <Text style={styles.editAvatarText}>{editName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={[styles.photoHint, isDark && styles.textSecondaryDark]}>
              Toca para cambiar la foto
            </Text>

            {/* Formulario */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark && styles.textDark]}>Nombre completo</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Ingresa tu nombre"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark && styles.textDark]}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark, styles.inputDisabled]}
                  value={editEmail}
                  editable={false}
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
                <Text style={[styles.hint, isDark && styles.textSecondaryDark]}>
                  El correo no se puede modificar
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    zIndex: 10,
  },
  headerBlur: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBlurLight: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  smallTitleContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchContainerDark: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  searchInputDark: {
    color: '#fff',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  profileCardDark: {
    backgroundColor: '#1c1c1e',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  menuCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardDark: {
    backgroundColor: '#1c1c1e',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuItemBorderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  emptySearchContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySearchText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonDark: {
    backgroundColor: '#1c1c1e',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f44336',
  },
  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContainerDark: {
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalHeaderDark: {
    backgroundColor: '#1c1c1e',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancel: {
    fontSize: 17,
    color: '#000',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalSave: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4CAF50',
  },
  modalSaveDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
  },
  photoSection: {
    position: 'relative',
    marginBottom: 8,
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1c1c1e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
});