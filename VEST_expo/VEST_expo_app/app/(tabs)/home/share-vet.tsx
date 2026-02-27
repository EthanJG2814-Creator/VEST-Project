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

export default function ShareVetScreen() {
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
          <Text style={[styles.title, { color: colors.foreground }]}>Share with Vet</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.iconSection}>
          <View style={[styles.mainIcon, { backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' }]}>
            <Ionicons name="document-text" size={40} color={colors.blue500} />
          </View>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            Prepare a health summary to send to your veterinarian with recent alerts, vitals, and recommendations.
          </Text>
        </View>

        <GlassCard>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Report Includes</Text>
          {['Heart rate history (last 24h)', 'Temperature readings', 'Alert log with timestamps', 'Activity & motion data'].map((item, i) => (
            <View key={item} style={styles.checkRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.green500} />
              <Text style={[styles.checkText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </GlassCard>

        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Send via Email</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="copy-outline" size={18} color={colors.foreground} />
            <Text style={[styles.actionBtnTextAlt, { color: colors.foreground }]}>Copy to Clipboard</Text>
          </Pressable>
        </View>
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
  iconSection: { alignItems: 'center', paddingVertical: 20, gap: 16 },
  mainIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  desc: { fontSize: FontSizes.subhead, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  sectionTitle: { fontSize: FontSizes.body, fontWeight: '700', marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkText: { fontSize: FontSizes.subhead },
  actions: { gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: BorderRadius.lg },
  actionBtnText: { fontSize: FontSizes.subhead, fontWeight: '600', color: '#FFFFFF' },
  actionBtnTextAlt: { fontSize: FontSizes.subhead, fontWeight: '600' },
});
