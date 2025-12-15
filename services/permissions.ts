import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

type EnsureLocationOptions = { requireBackground?: boolean; appName?: string };

export async function ensureLocationPermissions(
  options: EnsureLocationOptions = { requireBackground: true }
): Promise<boolean> {
  const { requireBackground = true, appName = 'la app' } = options;

  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      const go = await confirm(
        'Activa el GPS',
        'Los servicios de ubicación están desactivados en el dispositivo. Actívalos para continuar.',
        'Abrir ajustes'
      );
      if (go) await Linking.openSettings();
      return false;
    }
  } catch {}

  const fg = await Location.getForegroundPermissionsAsync();
  if (!fg.granted) {
    const cont = await confirm(
      'Permiso de ubicación',
      `Necesitamos tu ubicación para registrar actividad y seguridad laboral.\n\nSelecciona “Permitir al usar ${appName}”.`,
      'Continuar'
    );
    if (!cont) return false;

    const req = await Location.requestForegroundPermissionsAsync();
    if (!req.granted) {
      if (!req.canAskAgain) {
        const go = await confirm(
          'Ubicación denegada',
          'Debes otorgar el permiso de ubicación en Ajustes para continuar.',
          'Abrir ajustes'
        );
        if (go) await Linking.openSettings();
      }
      return false;
    }
  }

  if (requireBackground) {
    const bg = await Location.getBackgroundPermissionsAsync();
    if (!bg.granted) {
      const title = Platform.OS === 'ios' ? 'Ubicación en segundo plano' : 'Permitir todo el tiempo';
      const body =
        Platform.OS === 'ios'
          ? 'Para registrar tu jornada incluso con la app en segundo plano, selecciona “Permitir siempre” y activa “Ubicación precisa”.'
          : 'Para tracking continuo, selecciona “Permitir todo el tiempo” cuando el sistema lo solicite.';

      const cont = await confirm(title, body, 'Continuar');
      if (!cont) return false;

      const reqBg = await Location.requestBackgroundPermissionsAsync();
      if (!reqBg.granted) {
        const go = await confirm(
          'Falta permiso de segundo plano',
          Platform.OS === 'ios'
            ? 'Ajustes > Privacidad y seguridad > Localización > esta app > “Siempre” y activa “Ubicación precisa”.'
            : 'Abre Ajustes y otorga “Permitir todo el tiempo” para la ubicación.',
          'Abrir ajustes'
        );
        if (go) await Linking.openSettings();
        return false;
      }
    }
  }

  return true;
}

function confirm(title: string, message: string, positive: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: positive, onPress: () => resolve(true) },
    ]);
  });
}