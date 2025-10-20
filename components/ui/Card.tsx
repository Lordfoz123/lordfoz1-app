import { BorderRadius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'elevated';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  variant = 'default' 
}) => {
  const { colors, shadow } = useThemeColor();

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.cardBg },
      variant === 'default' && shadow.md,
      variant === 'elevated' && shadow.lg,
      variant === 'glass' && {
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
});