import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AnimatedBackground() {
  const isDark = useColorScheme() === 'dark';

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#0F172A', '#1E293B', '#0F172A']
          : ['#F8FAFC', '#EFF6FF', '#F8FAFC']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
