import { BaseColors, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FloatingButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  active?: boolean;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  onPress,
  style,
  active = false,
}) => {
  const { colors, shadow } = useThemeColor();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.cardBg },
        active && { backgroundColor: BaseColors.primaryPale },
        shadow.md,
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});