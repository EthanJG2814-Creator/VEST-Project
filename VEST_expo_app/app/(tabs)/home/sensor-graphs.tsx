import React, { useEffect, useMemo, useState } from 'react';
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
import {
  ARDUINO_METRIC_CONFIG,
  type ArduinoMetricConfig,
  type ArduinoMetricKey,
  type ArduinoMetricSection,
  type ArduinoSensorPacket,
  createMockArduinoPacket,
  createMockArduinoTimeline,
} from '@/constants/arduino-sensors';

const CHART_W = Dimensions.get('window').width - 64;
const CHART_H = 100;
const PREVIEW_UPDATE_INTERVAL_MS = 1_000;
const CHART_POINTS = 30;
const SECTION_ORDER: ArduinoMetricSection[] = ['Thermistor', 'ECG', 'Stretch', 'MPU #1', 'MPU #2'];

function getMetricSeries(packets: ArduinoSensorPacket[], key: ArduinoMetricKey) {
  let lastValue = 0;
  return packets.map((packet) => {
    const value = packet[key];
    if (value === null) {
      return lastValue;
    }
    lastValue = value;
    return value;
  });
}

function buildPath(data: number[], w: number, h: number, pad = 8) {
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const margin = Math.max((maxValue - minValue) * 0.15, 1);
  const min = minValue - margin;
  const max = maxValue + margin;
  const range = Math.max(max - min, Number.EPSILON);
  const step = w / (data.length - 1);
  const y = (v: number) => pad + ((max - v) / range) * (h - pad * 2);
  let d = `M 0 ${y(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    const x = i * step;
    const cpx = ((i - 1) * step + x) / 2;
    d += ` C ${cpx} ${y(data[i - 1])} ${cpx} ${y(data[i])} ${x} ${y(data[i])}`;
  }
  return d;
}

function formatMetricValue(metric: ArduinoMetricConfig, value: number | null) {
  if (metric.key === 'ecgRaw' && value === null) {
    return 'LEAD_OFF';
  }
  if (value === null) {
    return '--';
  }

  return `${value.toFixed(metric.decimals)} ${metric.unit}`;
}

export default function SensorGraphsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [packets, setPackets] = useState<ArduinoSensorPacket[]>(() =>
    createMockArduinoTimeline(CHART_POINTS, 100)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPackets((prev) => [...prev.slice(1), createMockArduinoPacket()]);
    }, PREVIEW_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const groupedMetrics = useMemo(() => {
    return ARDUINO_METRIC_CONFIG.reduce(
      (acc, metric) => {
        (acc[metric.section] ??= []).push(metric);
        return acc;
      },
      {} as Record<ArduinoMetricSection, ArduinoMetricConfig[]>
    );
  }, []);

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


        {SECTION_ORDER.map((section) => (
          <View key={section} style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.toUpperCase()}</Text>
            {(groupedMetrics[section] ?? []).map((metric) => {
              const series = getMetricSeries(packets, metric.key);
              const latestValue = packets[packets.length - 1]?.[metric.key] ?? null;
              const gradientId = `grad-${metric.key}`;

              return (
                <GlassCard key={metric.key} noPadding>
                  <View style={styles.chartHeader}>
                    <View style={styles.chartLabelRow}>
                      <View style={[styles.chartIcon, { backgroundColor: `${metric.color}20` }]}> 
                        <Ionicons name={metric.icon} size={14} color={metric.color} />
                      </View>
                      <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>
                        {metric.label.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.chartValue, { color: colors.foreground }]}>
                      {formatMetricValue(metric, latestValue)}
                    </Text>
                  </View>
                  <View style={styles.chartBody}>
                    <Svg width={CHART_W} height={CHART_H}>
                      <Defs>
                        <SvgGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                          <Stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                        </SvgGradient>
                      </Defs>
                      <Path
                        d={`${buildPath(series, CHART_W, CHART_H)} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`}
                        fill={`url(#${gradientId})`}
                      />
                      <Path d={buildPath(series, CHART_W, CHART_H)} stroke={metric.color} strokeWidth={2} fill="none" />
                    </Svg>
                  </View>
                </GlassCard>
              );
            })}
          </View>
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
  note: { fontSize: FontSizes.subhead, lineHeight: 20 },
  sectionBlock: { gap: 8 },
  sectionTitle: { fontSize: FontSizes.caption, fontWeight: '700', letterSpacing: 1, marginLeft: 4 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  chartLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  chartLabel: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 0.5 },
  chartValue: { fontSize: FontSizes.body, fontWeight: '700' },
  chartBody: { paddingHorizontal: 16, paddingBottom: 12, alignItems: 'center' },
});
