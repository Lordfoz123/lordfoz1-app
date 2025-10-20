import { getColors, Shadow } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useThemeColor() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);

  return { 
    colors, 
    isDark,
    shadow: {
      sm: Shadow.sm(isDark),
      md: Shadow.md(isDark),
      lg: Shadow.lg(isDark),
    }
  };
}