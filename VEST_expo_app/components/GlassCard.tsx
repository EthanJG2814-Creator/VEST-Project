import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BorderRadius } from '@/constants/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassCard({ children, style, intensity = 40, noPadding, ...props }: GlassCardProps) {
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.wrapper, style]} {...props}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[
        styles.overlay,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)' },
      ]} />
      <View style={[styles.content, noPadding && { padding: 0 }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
  },
});
