import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes, BorderRadius } from '@/constants/theme';

const alert = {
  title: 'Elevated Heart Rate',
  severity: 'High',
  time: 'Today, 2:14 PM',
  value: '145 BPM',
  baseline: '80–100 BPM',
  duration: '5 mins',
  context: 'Resting',
  recommendation: 'Monitor closely. If persistent for >30 mins, contact vet.',
};

export default function AlertDetailsScreen() {
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
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Alert Details</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Alert Icon */}
        <View style={styles.iconSection}>
          <View style={styles.alertPing}>
            <View style={[styles.alertCircle]}>
              <Ionicons name="warning" size={36} color="#EF4444" />
            </View>
          </View>
          <Text style={[styles.alertTitle, { color: '#F87171' }]}>{alert.title}</Text>
          <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>{alert.time}</Text>
        </View>

        {/* Details Card */}
        <GlassCard
          style={{
            borderColor: 'rgba(239,68,68,0.2)',
            backgroundColor: isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)',
          }}
        >
          {[
            { label: 'Measured Value', value: alert.value, bold: true },
            { label: 'Baseline (Rest)', value: alert.baseline },
            { label: 'Duration', value: alert.duration },
            { label: 'Context', value: alert.context, badge: true },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.detailRow,
                i < arr.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              {item.badge ? (
                <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                  <Text style={[styles.badgeText, { color: colors.foreground }]}>{item.value}</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.detailValue,
                    { color: colors.foreground },
                    item.bold && { fontSize: FontSizes.body, fontWeight: '700' },
                  ]}
                >
                  {item.value}
                </Text>
              )}
            </View>
          ))}
        </GlassCard>

        {/* Recommendation */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>RECOMMENDED ACTION</Text>
        <GlassCard
          style={{
            borderColor: 'rgba(59,130,246,0.2)',
            backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
          }}
        >
          <View style={styles.recRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.blue500} style={{ marginTop: 2 }} />
            <Text style={[styles.recText, { color: colors.foreground }]}>
              {alert.recommendation}
            </Text>
          </View>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          <Pressable
            onPress={() => router.push('/(tabs)/home/share-vet')}
            style={[styles.actionBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
          >
            <Ionicons name="share-outline" size={24} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>Share Data</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('tel:')}
            style={[styles.actionBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
          >
            <Ionicons name="call" size={24} color={colors.green400} />
            <Text style={[styles.actionText, { color: colors.green400 }]}>Call Vet</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.body, fontWeight: '600' },

  iconSection: { alignItems: 'center', paddingVertical: 20 },
  alertPing: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  alertCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: { fontSize: FontSizes.title3, fontWeight: '700' },
  alertTime: { fontSize: FontSizes.subhead, marginTop: 4 },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  detailLabel: { fontSize: FontSizes.subhead },
  detailValue: { fontSize: FontSizes.subhead, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSizes.caption, fontWeight: '500' },

  sectionTitle: { fontSize: FontSizes.caption, fontWeight: '700', letterSpacing: 1, marginTop: 4, marginLeft: 4 },

  recRow: { flexDirection: 'row', gap: 10 },
  recText: { flex: 1, fontSize: FontSizes.subhead, lineHeight: 22 },

  actionGrid: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  actionText: { fontSize: FontSizes.subhead, fontWeight: '600' },
});
