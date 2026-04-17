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
import { FontSizes } from '@/constants/theme';

const privacyItems = [
  {
    icon: 'lock-closed-outline' as const,
    title: 'Data Encryption',
    detail: 'All synced health data is encrypted in transit and at rest.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Account Protection',
    detail: 'Use a strong password and keep your app updated for best security.',
  },
  {
    icon: 'key-outline' as const,
    title: 'Session Controls',
    detail: 'Log out from shared devices after each monitoring session.',
  },
  {
    icon: 'document-text-outline' as const,
    title: 'Privacy Policy',
    detail: 'Review how your data is collected, used, and stored.',
  },
];

export default function PrivacySecurityScreen() {
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
          <Text style={[styles.title, { color: colors.foreground }]}>Privacy & Security</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Manage your privacy expectations and review core security safeguards.</Text>

        <GlassCard noPadding>
          {privacyItems.map((item, i) => (
            <View
              key={item.title}
              style={[
                styles.row,
                i < privacyItems.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name={item.icon} size={16} color={colors.foreground} />
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.rowDetail, { color: colors.mutedForeground }]}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: FontSizes.subhead, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  iconWrap: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { fontSize: FontSizes.subhead, fontWeight: '600' },
  rowDetail: { fontSize: FontSizes.caption, lineHeight: 18 },
});
