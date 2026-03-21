import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes, BorderRadius } from '@/constants/theme';

function PulsingCircle({ color, size }: { color: string; size: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {step === 0 && (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={styles.centerSection}
          >
            <View style={styles.circleContainer}>
              <PulsingCircle color="rgba(59,130,246,0.3)" size={128} />
              <View style={[styles.mainCircle, { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)' }]}>
                <Ionicons name="bluetooth" size={48} color={colors.blue500} />
              </View>
            </View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Searching for Vest...</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Ensure device is powered on and nearby.
            </Text>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            exiting={FadeOut.duration(300)}
            style={styles.centerSection}
          >
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Device Found!</Text>

            <Pressable onPress={() => setStep(2)}>
              <GlassCard
                style={{
                  borderColor: 'rgba(34,197,94,0.3)',
                  backgroundColor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
                  width: '100%',
                }}
              >
                <View style={styles.deviceRow}>
                  <View style={styles.deviceLeft}>
                    <View style={[styles.deviceIcon, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                      <Ionicons name="bluetooth" size={24} color={colors.green400} />
                    </View>
                    <View>
                      <Text style={[styles.deviceName, { color: colors.foreground }]}>VEST Device X1</Text>
                      <Text style={[styles.deviceSignal, { color: colors.mutedForeground }]}>Signal: Strong</Text>
                    </View>
                  </View>
                  <View style={styles.connectBadge}>
                    <Text style={styles.connectBadgeText}>Connect</Text>
                  </View>
                </View>
              </GlassCard>
            </Pressable>

            <Pressable
              onPress={() => setStep(0)}
              style={styles.scanAgain}
            >
              <Ionicons name="refresh" size={16} color={colors.mutedForeground} />
              <Text style={[styles.scanAgainText, { color: colors.mutedForeground }]}>Scan Again</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.centerSection}
          >
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
            <Text style={[styles.stepTitle, { color: colors.green400 }]}>Successfully Connected!</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Syncing recent data...
            </Text>

            <Pressable
              onPress={() => router.replace('/(tabs)/home')}
              style={styles.dashboardBtn}
            >
              <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  centerSection: { alignItems: 'center', gap: 16 },

  circleContainer: { width: 128, height: 128, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  mainCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 8,
  },
  stepTitle: { fontSize: FontSizes.title2, fontWeight: '700', textAlign: 'center', letterSpacing: -0.3 },
  stepDesc: { fontSize: FontSizes.subhead, textAlign: 'center' },

  deviceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  deviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  deviceName: { fontSize: FontSizes.body, fontWeight: '700' },
  deviceSignal: { fontSize: FontSizes.caption, marginTop: 2 },
  connectBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectBadgeText: { color: '#FFFFFF', fontWeight: '600', fontSize: FontSizes.subhead },

  scanAgain: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  scanAgainText: { fontSize: FontSizes.subhead },

  successCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 8,
    marginBottom: 16,
  },
  dashboardBtn: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  dashboardBtnText: { fontSize: FontSizes.body, fontWeight: '700', color: '#0F172A' },
});
