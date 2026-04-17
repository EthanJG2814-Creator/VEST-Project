import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useDogProfile } from '@/hooks/use-dog-profile';
import { FontSizes, Spacing, BorderRadius } from '@/constants/theme';

const vitals = {
  hr: 110,
  resp: 18,
  temp: 101.5,
  battery: 77,
  status: 'Normal',
};

const alerts = [
  { id: 1, type: 'Elevated Heart Rate', time: '2m ago', severity: 'medium' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { selectedProfile } = useDogProfile();

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
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: selectedProfile.image }}
              style={styles.avatar}
            />
            <View>
              <Text style={[styles.dogName, { color: colors.foreground }]}>{selectedProfile.name}</Text>
              <View style={styles.statusRow}>
                <Ionicons name="wifi" size={12} color={colors.mutedForeground} />
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Online</Text>
                <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
                <Ionicons name="battery-half" size={12} color={colors.mutedForeground} />
                <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                  {vitals.battery}%
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
            >
              <Ionicons name="settings-outline" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/home/live-alerts')}
              style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.foreground} />
              <View style={styles.notifDot} />
            </Pressable>
          </View>
        </View>

        {/* Status Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Pressable onPress={() => router.push('/(tabs)/home/live-data')}>
            <GlassCard
              style={[
                styles.statusCard,
                {
                  borderColor: isDark
                    ? 'rgba(45,212,191,0.2)'
                    : 'rgba(20,184,166,0.2)',
                },
              ]}
            >
              <View style={styles.statusCardInner}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusLabel, { color: colors.teal400 }]}>STATUS</Text>
                  <Text style={[styles.statusValue, { color: colors.foreground }]}>
                    {vitals.status}
                  </Text>
                  <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>
                    Vitals are stable and within personalized baseline.
                  </Text>
                </View>
                <View style={[styles.statusIcon, { backgroundColor: 'rgba(20,184,166,0.15)' }]}>
                  <Ionicons name="pulse" size={22} color={colors.teal400} />
                </View>
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* Alert Banner */}
        {alerts.length > 0 && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Pressable
              onPress={() => router.push('/(tabs)/home/alert-details')}
              style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}
            >
              <View
                style={[
                  styles.alertBanner,
                  {
                    backgroundColor: 'rgba(245,158,11,0.1)',
                    borderColor: 'rgba(245,158,11,0.2)',
                  },
                ]}
              >
                <View style={[styles.alertIcon, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                  <Ionicons name="warning" size={18} color={colors.amber500} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { color: colors.amber500 }]}>
                    {alerts[0].type}
                  </Text>
                  <Text style={{ fontSize: FontSizes.caption, color: 'rgba(245,158,11,0.6)', fontWeight: '500' }}>
                    {alerts[0].time}
                  </Text>
                </View>
                <Text style={{ fontSize: FontSizes.subhead, color: colors.amber500, fontWeight: '600' }}>
                  Review
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Vitals Grid */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <View style={styles.vitalsGrid}>
            {/* Heart Rate */}
            <Pressable
              onPress={() => router.push('/(tabs)/home/live-data')}
              style={{ flex: 1 }}
            >
              <GlassCard style={styles.vitalCard}>
                <View style={styles.vitalHeader}>
                  <View style={[styles.vitalIcon, { backgroundColor: 'rgba(244,63,94,0.15)' }]}>
                    <Ionicons name="heart" size={14} color={colors.rose500} />
                  </View>
                  <Text style={[styles.vitalLabel, { color: colors.mutedForeground }]}>HR</Text>
                </View>
                <View style={styles.vitalBottom}>
                  <View style={styles.vitalValueRow}>
                    <Text style={[styles.vitalValue, { color: colors.foreground }]}>{vitals.hr}</Text>
                    <Text style={[styles.vitalUnit, { color: colors.mutedForeground }]}>BPM</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '60%', backgroundColor: 'rgba(244,63,94,0.5)' }]} />
                  </View>
                </View>
              </GlassCard>
            </Pressable>

            {/* Respiration */}
            <Pressable
              onPress={() => router.push('/(tabs)/home/live-data')}
              style={{ flex: 1 }}
            >
              <GlassCard style={styles.vitalCard}>
                <View style={styles.vitalHeader}>
                  <View style={[styles.vitalIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                    <Ionicons name="analytics" size={14} color={colors.blue500} />
                  </View>
                  <Text style={[styles.vitalLabel, { color: colors.mutedForeground }]}>RESP</Text>
                </View>
                <View style={styles.vitalBottom}>
                  <View style={styles.vitalValueRow}>
                    <Text style={[styles.vitalValue, { color: colors.foreground }]}>{vitals.resp}</Text>
                    <Text style={[styles.vitalUnit, { color: colors.mutedForeground }]}>RPM</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '40%', backgroundColor: 'rgba(59,130,246,0.5)' }]} />
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          </View>
        </Animated.View>

        {/* Temperature */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <GlassCard>
            <View style={styles.tempRow}>
              <View style={styles.tempLeft}>
                <View style={[styles.tempIcon, { backgroundColor: 'rgba(249,115,22,0.15)' }]}>
                  <Ionicons name="thermometer" size={18} color={colors.orange500} />
                </View>
                <View>
                  <Text style={[styles.tempLabel, { color: colors.mutedForeground }]}>Temperature</Text>
                  <Text style={[styles.tempValue, { color: colors.foreground }]}>{vitals.temp}°F</Text>
                </View>
              </View>
              <View style={[styles.tempBadge, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                <Text style={{ fontSize: FontSizes.caption, fontWeight: '600', color: colors.green400 }}>
                  Optimal Range
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Environment */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <GlassCard>
            <Text style={[styles.envTitle, { color: colors.mutedForeground }]}>CURRENT ENVIRONMENT</Text>
            <View style={styles.envGrid}>
              <View style={styles.envItem}>
                <Ionicons name="cloud" size={20} color={colors.sky400} />
                <View>
                  <Text style={[styles.envValue, { color: colors.foreground }]}>83°F</Text>
                  <Text style={[styles.envLabel, { color: colors.mutedForeground }]}>Partly Cloudy</Text>
                </View>
              </View>
              <View style={[styles.envDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
              <View style={styles.envItem}>
                <Ionicons name="location" size={20} color={colors.indigo400} />
                <View>
                  <Text style={[styles.envValue, { color: colors.foreground }]}>Outdoors</Text>
                  <Text style={[styles.envLabel, { color: colors.mutedForeground }]}>Zachry Engineering Building</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  dogName: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusText: { fontSize: FontSizes.caption, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#000' },

  statusCard: { borderWidth: 1 },
  statusCardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusLabel: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 1 },
  statusValue: { fontSize: FontSizes.title1, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
  statusDesc: { fontSize: FontSizes.subhead, marginTop: 6, lineHeight: 20 },
  statusIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: BorderRadius.lg, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  alertIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: FontSizes.subhead, fontWeight: '600' },

  vitalsGrid: { flexDirection: 'row', gap: 12 },
  vitalCard: { height: 140, justifyContent: 'space-between' },
  vitalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vitalIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  vitalLabel: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 0.5 },
  vitalBottom: { gap: 6 },
  vitalValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  vitalValue: { fontSize: FontSizes.title1, fontWeight: '700', letterSpacing: -1 },
  vitalUnit: { fontSize: FontSizes.caption, fontWeight: '500' },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  tempRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tempLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tempIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  tempLabel: { fontSize: FontSizes.caption, fontWeight: '500' },
  tempValue: { fontSize: FontSizes.title3, fontWeight: '700', letterSpacing: -0.3 },
  tempBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },

  envTitle: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
  envGrid: { flexDirection: 'row', alignItems: 'center' },
  envItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  envDivider: { width: 1, height: 36, marginHorizontal: 12 },
  envValue: { fontSize: FontSizes.body, fontWeight: '700' },
  envLabel: { fontSize: FontSizes.caption, fontWeight: '500', marginTop: 1 },
});
