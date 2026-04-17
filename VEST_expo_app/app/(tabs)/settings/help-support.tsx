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

type SupportItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle: string;
  onPress: () => void;
};

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const supportItems: SupportItem[] = [
    {
      icon: 'mail-outline',
      label: 'Email Support',
      subtitle: 'support@vest.app',
      onPress: () => {
        void Linking.openURL('mailto:support@vest.app?subject=VEST%20Support');
      },
    },
    {
      icon: 'document-text-outline',
      label: 'FAQ',
      subtitle: 'Read common troubleshooting steps',
      onPress: () => {
        void Linking.openURL('https://example.com/vest-faq');
      },
    },
    {
      icon: 'bug-outline',
      label: 'Report a Bug',
      subtitle: 'Tell us what went wrong',
      onPress: () => {
        void Linking.openURL('mailto:support@vest.app?subject=VEST%20Bug%20Report');
      },
    },
  ];

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
          <Text style={[styles.title, { color: colors.foreground }]}>Help & Support</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Need help with your VEST device or app? Reach out through one of the support options below.</Text>

        <GlassCard noPadding>
          {supportItems.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' },
                i < supportItems.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name={item.icon} size={16} color={colors.foreground} />
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </GlassCard>

        <View style={[styles.noteCard, { borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)' }]}>
          <Text style={[styles.noteTitle, { color: colors.foreground }]}>Support Hours</Text>
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>Monday to Friday, 9:00 AM to 6:00 PM (local time)</Text>
        </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  iconWrap: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { fontSize: FontSizes.subhead, fontWeight: '600' },
  rowSubtitle: { fontSize: FontSizes.caption },
  noteCard: { borderWidth: 1, borderStyle: 'dashed', borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  noteTitle: { fontSize: FontSizes.subhead, fontWeight: '600' },
  noteText: { fontSize: FontSizes.caption },
});
