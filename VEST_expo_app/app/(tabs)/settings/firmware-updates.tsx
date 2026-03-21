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

export default function FirmwareUpdatesScreen() {
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
          <Text style={[styles.title, { color: colors.foreground }]}>Firmware Updates</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.iconSection}>
          <View style={[styles.checkCircle, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
            <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
          </View>
          <Text style={[styles.upToDate, { color: colors.foreground }]}>Up to Date</Text>
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
            Current firmware: v2.4.1
          </Text>
        </View>

        <GlassCard>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Release Notes – v2.4.1</Text>
          {[
            'Improved heart rate sensor accuracy',
            'Fixed Bluetooth reconnection issues',
            'Reduced battery consumption by 15%',
            'Added temperature calibration support',
          ].map((note, i) => (
            <View key={i} style={styles.noteRow}>
              <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.noteText, { color: colors.mutedForeground }]}>{note}</Text>
            </View>
          ))}
        </GlassCard>

        <Pressable style={[styles.checkBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
          <Ionicons name="refresh" size={18} color={colors.foreground} />
          <Text style={[styles.checkBtnText, { color: colors.foreground }]}>Check for Updates</Text>
        </Pressable>
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
  iconSection: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  upToDate: { fontSize: FontSizes.title3, fontWeight: '700' },
  versionText: { fontSize: FontSizes.subhead },
  sectionTitle: { fontSize: FontSizes.body, fontWeight: '700', marginBottom: 10 },
  noteRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  bullet: { fontSize: FontSizes.body, fontWeight: '700' },
  noteText: { flex: 1, fontSize: FontSizes.subhead, lineHeight: 20 },
  checkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: BorderRadius.lg },
  checkBtnText: { fontSize: FontSizes.subhead, fontWeight: '600' },
});
