import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes, BorderRadius } from '@/constants/theme';

const CHART_W = Dimensions.get('window').width - 64;
const CHART_H = 120;
const UPDATE_INTERVAL_MS = 5_000;

const HEART_RATE_MEAN = 110;
const HEART_RATE_SD = 2;
const RESPIRATION_MEAN = 20;
const RESPIRATION_SD = 1;

function randomNormal(mean: number, sd: number) {
  // Box-Muller transform for normally distributed samples.
  const u1 = Math.max(Math.random(), Number.EPSILON);
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * sd;
}

function generateData(count: number, base: number, variance: number) {
  return Array.from({ length: count }, () => randomNormal(base, variance));
}

function buildPath(data: number[], w: number, h: number, padding = 10) {
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const stepX = w / (data.length - 1);
  const scaleY = (v: number) => padding + ((max - v) / (max - min)) * (h - padding * 2);

  let d = `M 0 ${scaleY(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    const x = i * stepX;
    const y = scaleY(data[i]);
    const prevX = (i - 1) * stepX;
    const prevY = scaleY(data[i - 1]);
    const cpx = (prevX + x) / 2;
    d += ` C ${cpx} ${prevY} ${cpx} ${y} ${x} ${y}`;
  }
  return d;
}

function buildAreaPath(data: number[], w: number, h: number, padding = 10) {
  const line = buildPath(data, w, h, padding);
  return `${line} L ${w} ${h} L 0 ${h} Z`;
}

function MiniChart({
  data,
  color,
  gradientId,
  width,
  height,
}: {
  data: number[];
  color: string;
  gradientId: string;
  width: number;
  height: number;
}) {
  const linePath = buildPath(data, width, height);
  const areaPath = buildAreaPath(data, width, height);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </SvgGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradientId})`} />
      <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" />
    </Svg>
  );
}

export default function LiveDataScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [hrData, setHrData] = useState(() => generateData(20, HEART_RATE_MEAN, HEART_RATE_SD));
  const [respData, setRespData] = useState(() => generateData(20, RESPIRATION_MEAN, RESPIRATION_SD));

  useEffect(() => {
    const interval = setInterval(() => {
      setHrData(prev => {
        const next = [...prev.slice(1)];
        next.push(randomNormal(HEART_RATE_MEAN, HEART_RATE_SD));
        return next;
      });
      setRespData(prev => {
        const next = [...prev.slice(1)];
        next.push(randomNormal(RESPIRATION_MEAN, RESPIRATION_SD));
        return next;
      });
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const currentHR = Math.round(hrData[hrData.length - 1]);
  const currentResp = Math.round(respData[respData.length - 1]);

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
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Live Data</Text>
          <View style={[styles.liveIndicator, { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)' }]}>
            <View style={styles.liveDot}>
              <View style={styles.liveDotInner} />
            </View>
            <Text style={[styles.liveText, { color: colors.green500 }]}>CONNECTED</Text>
          </View>
        </View>

        {/* Heart Rate Chart */}
        <GlassCard noPadding>
          <View style={[styles.chartHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={styles.chartLabelRow}>
              <View style={[styles.chartIcon, { backgroundColor: 'rgba(244,63,94,0.15)' }]}>
                <Ionicons name="heart" size={14} color={colors.rose500} />
              </View>
              <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>HEART RATE</Text>
            </View>
            <View style={styles.chartValueRow}>
              <Text style={[styles.chartValue, { color: colors.foreground }]}>{currentHR}</Text>
              <Text style={[styles.chartUnit, { color: colors.mutedForeground }]}>BPM</Text>
            </View>
          </View>
          <View style={styles.chartBody}>
            <MiniChart
              data={hrData}
              color="#F43F5E"
              gradientId="hrGrad"
              width={CHART_W}
              height={CHART_H}
            />
          </View>
        </GlassCard>

        {/* Respiration Chart */}
        <GlassCard noPadding>
          <View style={[styles.chartHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={styles.chartLabelRow}>
              <View style={[styles.chartIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                <Ionicons name="water" size={14} color={colors.blue500} />
              </View>
              <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>RESPIRATION</Text>
            </View>
            <View style={styles.chartValueRow}>
              <Text style={[styles.chartValue, { color: colors.foreground }]}>{currentResp}</Text>
              <Text style={[styles.chartUnit, { color: colors.mutedForeground }]}>RPM</Text>
            </View>
          </View>
          <View style={styles.chartBody}>
            <MiniChart
              data={respData}
              color="#3B82F6"
              gradientId="respGrad"
              width={CHART_W}
              height={CHART_H}
            />
          </View>
        </GlassCard>

        <Pressable onPress={() => router.push('/(tabs)/home/sensor-graphs')}>
          <GlassCard>
            <View style={styles.allSensorsRow}>
              <View style={[styles.allSensorsIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}> 
                <Ionicons name="analytics" size={18} color={colors.blue500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.allSensorsTitle, { color: colors.foreground }]}>All Sensor Channels</Text>
                <Text style={[styles.allSensorsDesc, { color: colors.mutedForeground }]}>
                  Thermistor, ECG, stretch, MPU1 and MPU2 outputs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </View>
          </GlassCard>
        </Pressable>

        {/* Other Vitals */}
        <View style={styles.otherGrid}>
          <GlassCard style={{ flex: 1 }}>
            <View style={styles.miniHeader}>
              <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>TEMP</Text>
              <Ionicons name="thermometer" size={16} color={colors.orange500} />
            </View>
            <Text style={[styles.miniValue, { color: colors.foreground }]}>101.5°F</Text>
          </GlassCard>
          <GlassCard style={{ flex: 1 }}>
            <View style={styles.miniHeader}>
              <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>MOTION</Text>
              <Ionicons name="walk" size={16} color={colors.purple500} />
            </View>
            <Text style={[styles.miniValue, { color: colors.foreground }]}>Resting</Text>
          </GlassCard>
        </View>
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
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  liveDotInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#22C55E' },
  liveText: { fontSize: FontSizes.caption2, fontWeight: '700', letterSpacing: 0.5 },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  chartLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  chartLabel: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 0.5 },
  chartValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  chartValue: { fontSize: FontSizes.title3, fontWeight: '700' },
  chartUnit: { fontSize: FontSizes.caption, fontWeight: '500' },
  chartBody: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },

  allSensorsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  allSensorsIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  allSensorsTitle: { fontSize: FontSizes.subhead, fontWeight: '700' },
  allSensorsDesc: { fontSize: FontSizes.caption, marginTop: 2 },

  otherGrid: { flexDirection: 'row', gap: 12 },
  miniHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  miniLabel: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 0.5 },
  miniValue: { fontSize: FontSizes.title3, fontWeight: '700', letterSpacing: -0.3 },
});
