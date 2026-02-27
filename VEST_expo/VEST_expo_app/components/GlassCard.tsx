import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp, useColorScheme } from 'react-native';
import { BorderRadius } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export function GlassCard({ children, style, noPadding }: GlassCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(255,255,255,0.8)',
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.06)',
        },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
});
