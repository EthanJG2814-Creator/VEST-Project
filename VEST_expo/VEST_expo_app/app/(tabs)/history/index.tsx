import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes, BorderRadius } from '@/constants/theme';

const weeklyData = [
  { day: 'Mon', hr: 72 },
  { day: 'Tue', hr: 75 },
  { day: 'Wed', hr: 70 },
  { day: 'Thu', hr: 85 },
  { day: 'Fri', hr: 73 },
  { day: 'Sat', hr: 78 },
  { day: 'Sun', hr: 74 },
];

const maxHr = Math.max(...weeklyData.map(d => d.hr));

export default function HistoryScreen() {
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/history/export')}
            style={[styles.exportBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
          >
            <Ionicons name="download-outline" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Date Selector */}
        <GlassCard>
          <View style={styles.dateRow}>
            <Pressable style={styles.dateArrow}>
              <Ionicons name="chevron-back" size={18} color={colors.foreground} />
            </Pressable>
            <View style={styles.dateCenter}>
              <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
              <Text style={[styles.dateText, { color: colors.foreground }]}>Feb 15 – Feb 21</Text>
            </View>
            <Pressable style={styles.dateArrow}>
              <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
            </Pressable>
          </View>
        </GlassCard>

        {/* Bar Chart */}
        <GlassCard>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Weekly Average HR</Text>
          <View style={styles.barChart}>
            {weeklyData.map((item) => {
              const barH = (item.hr / maxHr) * 100;
              return (
                <View key={item.day} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barH}%`,
                          backgroundColor: colors.rose500,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{item.day}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.avgText, { color: colors.mutedForeground }]}>
            Average Heart Rate: <Text style={{ fontWeight: '700', color: colors.foreground }}>75 BPM</Text>
          </Text>
        </GlassCard>

        {/* Activity Summary */}
        <GlassCard
          style={{
            borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
          }}
        >
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Activity Summary</Text>
          <View style={styles.actGrid}>
            {[
              { value: '4.2h', label: 'Active Time' },
              { value: '8.5h', label: 'Rest Time' },
              { value: '1254', label: 'Calories' },
              { value: '5.4km', label: 'Distance' },
            ].map((item) => (
              <View
                key={item.label}
                style={[styles.actCell, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}
              >
                <Text style={[styles.actValue, { color: colors.foreground }]}>{item.value}</Text>
                <Text style={[styles.actLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  title: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5 },
  exportBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateArrow: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dateCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: FontSizes.subhead, fontWeight: '500' },

  chartTitle: { fontSize: FontSizes.body, fontWeight: '700', marginBottom: 12 },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', height: 100, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.04)' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: FontSizes.caption2, fontWeight: '500' },
  avgText: { fontSize: FontSizes.subhead, textAlign: 'center', marginTop: 12 },

  actGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actCell: { width: '47%', paddingVertical: 12, paddingHorizontal: 12, borderRadius: BorderRadius.md },
  actValue: { fontSize: FontSizes.title3, fontWeight: '700' },
  actLabel: { fontSize: FontSizes.caption, fontWeight: '500', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' },
});
