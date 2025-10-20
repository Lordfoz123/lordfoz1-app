import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { MapPointColors } from '@/constants/theme';

type PointStatus = 'pending' | 'next' | 'completed' | 'alert' | 'inProgress' | 'inactive';

interface MonitoringPointMarkerProps {
  status: PointStatus;
  number?: number;
}

export const MonitoringPointMarker: React.FC<MonitoringPointMarkerProps> = ({
  status,
  number,
}) => {
  const config = MapPointColors[status];
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (config.animated) {
      scale.value = withRepeat(
        withTiming(1.3, { duration: config.pulseSpeed || 2000 }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(0, { duration: config.pulseSpeed || 2000 }),
        -1,
        false
      );
    }
  }, [status]);

  const animatedWaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {config.animated && (
        <Animated.View
          style={[
            styles.wave,
            { backgroundColor: config.color },
            animatedWaveStyle,
          ]}
        />
      )}

      <View style={[styles.point, { backgroundColor: config.color }]}>
        {config.showCheckmark ? (
          <Check size={16} color="#FFF" strokeWidth={3} />
        ) : (
          number && (
            <Text style={styles.numberText}>{number}</Text>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  point: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  numberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});