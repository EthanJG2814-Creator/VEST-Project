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

const exportFormats = [
  { label: 'PDF Report', desc: 'Formatted summary for vet visits', icon: 'document-text' as const, color: '#EF4444' },
  { label: 'CSV Data', desc: 'Raw sensor data for analysis', icon: 'grid' as const, color: '#3B82F6' },
  { label: 'JSON Export', desc: 'Structured data for integrations', icon: 'code-slash' as const, color: '#A855F7' },
];

export default function ExportScreen() {
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
          <Text style={[styles.title, { color: colors.foreground }]}>Export Data</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Choose an export format to share or save your pet's health data.
        </Text>

        {exportFormats.map((fmt) => (
          <Pressable key={fmt.label} style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
            <GlassCard>
              <View style={styles.formatRow}>
                <View style={[styles.formatIcon, { backgroundColor: `${fmt.color}15` }]}>
                  <Ionicons name={fmt.icon} size={22} color={fmt.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formatLabel, { color: colors.foreground }]}>{fmt.label}</Text>
                  <Text style={[styles.formatDesc, { color: colors.mutedForeground }]}>{fmt.desc}</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={colors.mutedForeground} />
              </View>
            </GlassCard>
          </Pressable>
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
  subtitle: { fontSize: FontSizes.subhead, marginLeft: 4, lineHeight: 22 },
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  formatIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  formatLabel: { fontSize: FontSizes.body, fontWeight: '600' },
  formatDesc: { fontSize: FontSizes.subhead, marginTop: 2 },
});
