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
import { useDogProfile } from '@/hooks/use-dog-profile';
import { DOG_PROFILES } from '@/constants/dog-profiles';
import { FontSizes, BorderRadius } from '@/constants/theme';

export default function LogoutScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { setSelectedProfile } = useDogProfile();

  const confirmLogout = () => {
    setSelectedProfile(DOG_PROFILES[0]);
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Log Out</Text>
          <View style={{ width: 36 }} />
        </View>

        <GlassCard style={styles.card}>
          <View style={[styles.warnIconWrap, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
            <Ionicons name="log-out-outline" size={28} color="#F87171" />
          </View>
          <Text style={[styles.heading, { color: colors.foreground }]}>Are you sure you want to log out?</Text>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>You will be returned to profile selection and any in-progress flow will be interrupted.</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.cancelBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={confirmLogout}
              style={[styles.logoutBtn, { backgroundColor: 'rgba(239,68,68,0.14)' }]}
            >
              <Ionicons name="log-out-outline" size={16} color="#F87171" />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, flexGrow: 1, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5 },
  card: { alignItems: 'center', gap: 12, marginTop: 12 },
  warnIconWrap: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: FontSizes.title3, fontWeight: '700', textAlign: 'center' },
  copy: { fontSize: FontSizes.subhead, textAlign: 'center', lineHeight: 20 },
  actions: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  cancelText: { fontSize: FontSizes.subhead, fontWeight: '600' },
  logoutBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 14,
  },
  logoutText: { fontSize: FontSizes.subhead, fontWeight: '700', color: '#F87171' },
});
