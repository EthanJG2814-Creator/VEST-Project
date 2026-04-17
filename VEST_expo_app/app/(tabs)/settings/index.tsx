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

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsItem {
  icon: IoniconsName;
  label: string;
  path: string;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const sections: SettingsSection[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Profile', path: '/(auth)/sign-in' },
      { icon: 'notifications-outline', label: 'Notifications', path: '/(tabs)/home/live-alerts' },
      { icon: 'shield-outline', label: 'Privacy & Security', path: '' },
    ],
  },
  {
    title: 'Device',
    items: [
      { icon: 'phone-portrait-outline', label: 'Device Info', path: '/(tabs)/settings/device-info' },
      { icon: 'help-circle-outline', label: 'Help & Support', path: '' },
      { icon: 'cloud-download-outline', label: 'Firmware Updates', path: '/(tabs)/settings/firmware-updates' },
    ],
  },
];

export default function SettingsScreen() {
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
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

        {sections.map((section) => (
          <View key={section.title}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {section.title.toUpperCase()}
            </Text>
            <GlassCard noPadding>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  onPress={() => item.path ? router.push(item.path as any) : null}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' },
                    i < section.items.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.rowIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                      <Ionicons name={item.icon} size={16} color={colors.foreground} />
                    </View>
                    <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* Log Out */}
        <Pressable
          style={[styles.logoutBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
        >
          <Ionicons name="log-out-outline" size={18} color="#F87171" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>VEST v1.0.2</Text>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Firmware v2.4.1</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  title: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5, paddingVertical: 4 },

  sectionTitle: { fontSize: FontSizes.caption, fontWeight: '600', letterSpacing: 1, marginLeft: 4, marginBottom: 6, marginTop: 4 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: FontSizes.subhead, fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    marginTop: 8,
  },
  logoutText: { fontSize: FontSizes.subhead, fontWeight: '600', color: '#F87171' },

  footer: { alignItems: 'center', gap: 2, marginTop: 16 },
  footerText: { fontSize: FontSizes.caption },
});
