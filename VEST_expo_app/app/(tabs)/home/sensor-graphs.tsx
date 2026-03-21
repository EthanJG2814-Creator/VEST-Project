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
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes } from '@/constants/theme';

const CHART_W = Dimensions.get('window').width - 64;
const CHART_H = 100;

function generateData(count: number, base: number, variance: number) {
  return Array.from({ length: count }, (_, i) => base + Math.sin(i / 4) * variance + (Math.random() - 0.5) * variance * 0.3);
}

function buildPath(data: number[], w: number, h: number, pad = 8) {
  const min = Math.min(...data) - 3;
  const max = Math.max(...data) + 3;
  const step = w / (data.length - 1);
  const y = (v: number) => pad + ((max - v) / (max - min)) * (h - pad * 2);
  let d = `M 0 ${y(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    const x = i * step;
    const cpx = ((i - 1) * step + x) / 2;
    d += ` C ${cpx} ${y(data[i - 1])} ${cpx} ${y(data[i])} ${x} ${y(data[i])}`;
  }
  return d;
}

const sensors = [
  { name: 'Heart Rate', unit: 'BPM', icon: 'heart' as const, color: '#F43F5E', data: generateData(30, 78, 10) },
  { name: 'Respiration', unit: 'RPM', icon: 'water' as const, color: '#3B82F6', data: generateData(30, 20, 4) },
  { name: 'Temperature', unit: '°F', icon: 'thermometer' as const, color: '#F97316', data: generateData(30, 101.5, 0.8) },
];

export default function SensorGraphsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

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
          <Text style={[styles.title, { color: colors.foreground }]}>Sensor Graphs</Text>
          <View style={{ width: 36 }} />
        </View>

        {sensors.map((s) => {
          const current = s.data[s.data.length - 1];
          return (
            <Pressable key={s.name} onPress={() => router.push('/(tabs)/home/sensor-details')}>
              <GlassCard noPadding>
                <View style={styles.chartHeader}>
                  <View style={styles.chartLabelRow}>
                    <View style={[styles.chartIcon, { backgroundColor: `${s.color}20` }]}>
                      <Ionicons name={s.icon} size={14} color={s.color} />
                    </View>
                    <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>{s.name.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.chartValue, { color: colors.foreground }]}>
                    {s.name === 'Temperature' ? current.toFixed(1) : Math.round(current)} <Text style={{ fontSize: FontSizes.caption, color: colors.mutedForeground }}>{s.unit}</Text>
                  </Text>
                </View>
                <View style={styles.chartBody}>
                  <Svg width={CHART_W} height={CHART_H}>
                    <Defs>
                      <SvgGradient id={`grad-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                        <Stop offset="100%" stopColor={s.color} stopOpacity={0} />
                      </SvgGradient>
                    </Defs>
                    <Path
                      d={`${buildPath(s.data, CHART_W, CHART_H)} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`}
                      fill={`url(#grad-${s.name})`}
                    />
                    <Path d={buildPath(s.data, CHART_W, CHART_H)} stroke={s.color} strokeWidth={2} fill="none" />
                  </Svg>
                </View>
              </GlassCard>
            </Pressable>
          );
        })}
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
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  chartLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  chartLabel: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 0.5 },
  chartValue: { fontSize: FontSizes.body, fontWeight: '700' },
  chartBody: { paddingHorizontal: 16, paddingBottom: 12, alignItems: 'center' },
});
