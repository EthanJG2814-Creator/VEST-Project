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

const deviceInfo = [
  { label: 'Device Name', value: 'VEST Device X1' },
  { label: 'Serial Number', value: 'VX1-2024-00847' },
  { label: 'Firmware Version', value: 'v2.4.1' },
  { label: 'Hardware Version', value: 'Rev C' },
  { label: 'Battery', value: '82%', badge: true, badgeColor: '#22C55E' },
  { label: 'Connection', value: 'Bluetooth 5.0' },
  { label: 'Last Synced', value: 'Just now' },
  { label: 'Uptime', value: '14d 6h 32m' },
];

export default function DeviceInfoScreen() {
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
          <Text style={[styles.title, { color: colors.foreground }]}>Device Info</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.iconSection}>
          <View style={[styles.deviceIcon, { backgroundColor: isDark ? 'rgba(10,132,255,0.12)' : 'rgba(0,122,255,0.08)' }]}>
            <Ionicons name="hardware-chip" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.deviceName, { color: colors.foreground }]}>VEST Device X1</Text>
          <View style={[styles.connectedBadge, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
            <View style={styles.connDot} />
            <Text style={styles.connText}>Connected</Text>
          </View>
        </View>

        <GlassCard noPadding>
          {deviceInfo.map((item, i) => (
            <View
              key={item.label}
              style={[
                styles.row,
                { paddingHorizontal: 16 },
                i < deviceInfo.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              {item.badge ? (
                <View style={[styles.valueBadge, { backgroundColor: `${item.badgeColor}15` }]}>
                  <Text style={[styles.valueBadgeText, { color: item.badgeColor }]}>{item.value}</Text>
                </View>
              ) : (
                <Text style={[styles.rowValue, { color: colors.foreground }]}>{item.value}</Text>
              )}
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5 },
  iconSection: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  deviceIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  deviceName: { fontSize: FontSizes.title3, fontWeight: '700' },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full },
  connDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  connText: { fontSize: FontSizes.caption, fontWeight: '600', color: '#22C55E' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  rowLabel: { fontSize: FontSizes.subhead },
  rowValue: { fontSize: FontSizes.subhead, fontWeight: '500' },
  valueBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  valueBadgeText: { fontSize: FontSizes.caption, fontWeight: '600' },
});
