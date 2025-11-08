import { Colors } from '@/constants/theme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const UserLocationMarker: React.FC = () => {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  const opacity1 = useSharedValue(0.5);
  const opacity2 = useSharedValue(0.5);
  const opacity3 = useSharedValue(0.5);

  useEffect(() => {
    scale1.value = withRepeat(
      withTiming(3, { duration: 2000 }),
      -1,
      false
    );
    opacity1.value = withRepeat(
      withTiming(0, { duration: 2000 }),
      -1,
      false
    );

    scale2.value = withRepeat(
      withDelay(600, withTiming(3, { duration: 2000 })),
      -1,
      false
    );
    opacity2.value = withRepeat(
      withDelay(600, withTiming(0, { duration: 2000 })),
      -1,
      false
    );

    scale3.value = withRepeat(
      withDelay(1200, withTiming(3, { duration: 2000 })),
      -1,
      false
    );
    opacity3.value = withRepeat(
      withDelay(1200, withTiming(0, { duration: 2000 })),
      -1,
      false
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: opacity3.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wave, animatedStyle3]} />
      <Animated.View style={[styles.wave, animatedStyle2]} />
      <Animated.View style={[styles.wave, animatedStyle1]} />
      <View style={styles.center} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  center: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryDark,
    borderWidth: 2,
    borderColor: Colors.bgPrimary,
  },
});