import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes, BorderRadius } from '@/constants/theme';

const alerts = [
  { id: 1, type: 'Elevated Heart Rate', time: '2m ago', severity: 'high', icon: 'heart' as const, color: '#F43F5E' },
  { id: 2, type: 'High Temperature', time: '15m ago', severity: 'medium', icon: 'thermometer' as const, color: '#F97316' },
  { id: 3, type: 'Unusual Activity Pattern', time: '1h ago', severity: 'low', icon: 'walk' as const, color: '#F59E0B' },
];

export default function LiveAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Live Alerts</Text>
          <View style={{ width: 36 }} />
        </View>

        {alerts.map((alert) => (
          <Pressable
            key={alert.id}
            onPress={() => router.push('/(tabs)/home/alert-details')}
            style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}
          >
            <GlassCard>
              <View style={styles.alertRow}>
                <View style={[styles.alertIcon, { backgroundColor: `${alert.color}20` }]}>
                  <Ionicons name={alert.icon} size={18} color={alert.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertType, { color: colors.foreground }]}>{alert.type}</Text>
                  <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>{alert.time}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: `${alert.color}15` }]}>
                  <Text style={[styles.severityText, { color: alert.color }]}>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  alertType: { fontSize: FontSizes.subhead, fontWeight: '600' },
  alertTime: { fontSize: FontSizes.caption, marginTop: 2 },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  severityText: { fontSize: FontSizes.caption, fontWeight: '600' },
});
