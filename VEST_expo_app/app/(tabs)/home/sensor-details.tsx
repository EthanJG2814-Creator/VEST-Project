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

const sensorData = {
  name: 'Heart Rate Sensor',
  model: 'PPG Optical v3.2',
  status: 'Active',
  lastReading: '78 BPM',
  accuracy: '98.2%',
  sampleRate: '100 Hz',
  firmware: 'v2.4.1',
};

export default function SensorDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const rows = [
    { label: 'Model', value: sensorData.model },
    { label: 'Status', value: sensorData.status, badge: true, badgeColor: '#22C55E' },
    { label: 'Last Reading', value: sensorData.lastReading },
    { label: 'Accuracy', value: sensorData.accuracy },
    { label: 'Sample Rate', value: sensorData.sampleRate },
    { label: 'Firmware', value: sensorData.firmware },
  ];

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
          <Text style={[styles.title, { color: colors.foreground }]}>Sensor Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.iconSection}>
          <View style={[styles.sensorIcon, { backgroundColor: 'rgba(244,63,94,0.12)' }]}>
            <Ionicons name="heart" size={32} color={colors.rose500} />
          </View>
          <Text style={[styles.sensorName, { color: colors.foreground }]}>{sensorData.name}</Text>
        </View>

        <GlassCard noPadding>
          {rows.map((row, i) => (
            <View
              key={row.label}
              style={[
                styles.detailRow,
                { paddingHorizontal: 16 },
                i < rows.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              {row.badge ? (
                <View style={[styles.statusBadge, { backgroundColor: `${row.badgeColor}15` }]}>
                  <View style={[styles.statusDot, { backgroundColor: row.badgeColor }]} />
                  <Text style={[styles.statusText, { color: row.badgeColor }]}>{row.value}</Text>
                </View>
              ) : (
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{row.value}</Text>
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
  iconSection: { alignItems: 'center', paddingVertical: 16, gap: 12 },
  sensorIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  sensorName: { fontSize: FontSizes.title3, fontWeight: '700' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  detailLabel: { fontSize: FontSizes.subhead },
  detailValue: { fontSize: FontSizes.subhead, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSizes.caption, fontWeight: '600' },
});
