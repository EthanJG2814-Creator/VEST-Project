import React, { useState } from 'react';
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

const steps = [
  { title: 'Power On Device', desc: 'Press and hold the button on the VEST until the LED flashes blue.', icon: 'power' as const },
  { title: 'Enable Bluetooth', desc: 'Make sure Bluetooth is turned on in your phone settings.', icon: 'bluetooth' as const },
  { title: 'Place Near Phone', desc: 'Keep the VEST within 1 meter of your phone for initial pairing.', icon: 'phone-portrait' as const },
  { title: 'Wait for Connection', desc: 'The app will automatically detect and connect to your VEST device.', icon: 'wifi' as const },
];

export default function BluetoothWizardScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(0);

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
          <Text style={[styles.title, { color: colors.foreground }]}>Connection Guide</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i <= currentStep ? colors.primary : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                },
              ]}
            />
          ))}
        </View>

        {steps.map((step, i) => (
          <Pressable key={i} onPress={() => setCurrentStep(i)}>
            <GlassCard
              style={[
                i === currentStep && {
                  borderColor: isDark ? 'rgba(10,132,255,0.3)' : 'rgba(0,122,255,0.2)',
                },
              ]}
            >
              <View style={styles.stepRow}>
                <View style={[
                  styles.stepNum,
                  {
                    backgroundColor: i <= currentStep ? colors.primary : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  },
                ]}>
                  {i < currentStep ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={[
                      styles.stepNumText,
                      { color: i === currentStep ? '#FFFFFF' : colors.mutedForeground },
                    ]}>{i + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
                </View>
                <Ionicons name={step.icon} size={22} color={i <= currentStep ? colors.primary : colors.mutedForeground} />
              </View>
            </GlassCard>
          </Pressable>
        ))}

        <Pressable
          onPress={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              router.back();
            }
          }}
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.nextBtnText}>
            {currentStep < steps.length - 1 ? 'Next Step' : 'Done'}
          </Text>
        </Pressable>
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
  progressRow: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  progressDot: {},
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontSize: FontSizes.caption, fontWeight: '700' },
  stepTitle: { fontSize: FontSizes.body, fontWeight: '600', marginBottom: 2 },
  stepDesc: { fontSize: FontSizes.subhead, lineHeight: 20 },
  nextBtn: { paddingVertical: 16, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: 8 },
  nextBtnText: { fontSize: FontSizes.body, fontWeight: '600', color: '#FFFFFF' },
});
