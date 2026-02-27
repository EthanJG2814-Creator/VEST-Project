import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/use-app-theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function GradientOrb({
  color,
  size,
  initialX,
  initialY,
  duration,
}: {
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
}) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: initialX,
          top: initialY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export function AnimatedBackground() {
  const { isDark } = useAppTheme();

  if (!isDark) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F2F7' }]} />
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]}>
      <GradientOrb
        color="rgba(99,102,241,0.12)"
        size={SCREEN_W * 0.9}
        initialX={-SCREEN_W * 0.2}
        initialY={-SCREEN_H * 0.1}
        duration={15000}
      />
      <GradientOrb
        color="rgba(168,85,247,0.10)"
        size={SCREEN_W * 0.8}
        initialX={SCREEN_W * 0.3}
        initialY={SCREEN_H * 0.05}
        duration={12000}
      />
      <GradientOrb
        color="rgba(20,184,166,0.10)"
        size={SCREEN_W * 0.8}
        initialX={SCREEN_W * 0.1}
        initialY={SCREEN_H * 0.5}
        duration={18000}
      />
      <GradientOrb
        color="rgba(59,130,246,0.08)"
        size={SCREEN_W * 0.6}
        initialX={SCREEN_W * 0.4}
        initialY={SCREEN_H * 0.6}
        duration={20000}
      />
    </View>
  );
}
