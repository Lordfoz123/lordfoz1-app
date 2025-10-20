import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Iniciando registro desde UI...');
      await register(email, password, name);
      console.log('✅ Registro completado desde UI');
      
      Alert.alert(
        '¡Éxito!',
        'Cuenta creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Usuario registrado y autenticado');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error en handleRegister:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
            <Ionicons name="person-add" size={60} color="#4CAF50" />
          </View>
          <Text style={[styles.title, isDark && styles.titleDark]}>Crear Cuenta</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Únete al equipo</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#999' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Nombre completo"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#999' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Email"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#999' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Contraseña (mín. 6 caracteres)"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={isDark ? '#999' : '#666'}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#999' : '#666'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Confirmar contraseña"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={isDark ? '#999' : '#666'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.linkText, isDark && styles.linkTextDark]}>
              ¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainerDark: {
    backgroundColor: '#1a3a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  subtitleDark: {
    color: '#999',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 55,
  },
  inputContainerDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputDark: {
    color: '#fff',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextDark: {
    color: '#999',
  },
  linkTextBold: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});