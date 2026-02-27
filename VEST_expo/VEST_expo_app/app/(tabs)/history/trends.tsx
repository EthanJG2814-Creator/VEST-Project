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
  return Array.from({ length: count }, (_, i) => base + Math.sin(i / 5) * variance + (Math.random() - 0.5) * variance * 0.4);
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

const trends = [
  { name: 'Heart Rate Trend', color: '#F43F5E', data: generateData(60, 76, 8), unit: 'BPM avg', avg: '76' },
  { name: 'Respiration Trend', color: '#3B82F6', data: generateData(60, 19, 3), unit: 'RPM avg', avg: '19' },
  { name: 'Temperature Trend', color: '#F97316', data: generateData(60, 101.3, 0.5), unit: '°F avg', avg: '101.3' },
];

export default function TrendsScreen() {
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
          <Text style={[styles.title, { color: colors.foreground }]}>Trends</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={[styles.period, { color: colors.mutedForeground }]}>Last 30 days</Text>

        {trends.map((t) => (
          <GlassCard key={t.name} noPadding>
            <View style={styles.trendHeader}>
              <Text style={[styles.trendName, { color: colors.foreground }]}>{t.name}</Text>
              <Text style={[styles.trendAvg, { color: t.color }]}>
                {t.avg} <Text style={{ fontSize: FontSizes.caption, color: colors.mutedForeground }}>{t.unit}</Text>
              </Text>
            </View>
            <View style={styles.chartBody}>
              <Svg width={CHART_W} height={CHART_H}>
                <Defs>
                  <SvgGradient id={`tg-${t.name}`} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={t.color} stopOpacity={0.25} />
                    <Stop offset="100%" stopColor={t.color} stopOpacity={0} />
                  </SvgGradient>
                </Defs>
                <Path d={`${buildPath(t.data, CHART_W, CHART_H)} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`} fill={`url(#tg-${t.name})`} />
                <Path d={buildPath(t.data, CHART_W, CHART_H)} stroke={t.color} strokeWidth={2} fill="none" />
              </Svg>
            </View>
          </GlassCard>
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
  period: { fontSize: FontSizes.subhead, marginLeft: 4 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  trendName: { fontSize: FontSizes.subhead, fontWeight: '600' },
  trendAvg: { fontSize: FontSizes.body, fontWeight: '700' },
  chartBody: { paddingHorizontal: 16, paddingBottom: 12, alignItems: 'center' },
});
