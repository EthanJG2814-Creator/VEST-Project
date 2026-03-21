import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useBle } from '@/hooks/use-ble';

const mentalModel = [
  { title: 'Central', desc: 'Your Expo app scans and connects.', icon: 'phone-portrait-outline' as const },
  { title: 'Peripheral', desc: 'The VEST device exposes data.', icon: 'hardware-chip-outline' as const },
  { title: 'Service', desc: 'Grouping of related characteristics.', icon: 'albums-outline' as const },
  { title: 'Characteristic', desc: 'Individual data source to read/notify.', icon: 'pulse-outline' as const },
];

export default function BluetoothWizardScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const {
    permissionGranted,
    requestPermissions,
    scanForPeripherals,
    stopScan,
    isScanning,
    isConnecting,
    allDevices,
    connectToDevice,
    connectedDevice,
    color,
    logs,
  } = useBle();

  const checklist = [
    {
      title: 'Request permissions',
      desc: 'Bluetooth Nearby / Location on Android, automatic on iOS.',
      icon: 'shield-checkmark-outline' as const,
      done: permissionGranted,
      action: requestPermissions,
      cta: permissionGranted ? 'Granted' : 'Request',
    },
    {
      title: isScanning ? 'Scanning for peripherals…' : 'Scan for peripherals',
      desc: 'Discovers nearby devices that match the VEST name.',
      icon: 'radio-outline' as const,
      done: !isScanning && allDevices.length > 0,
      action: isScanning ? stopScan : scanForPeripherals,
      cta: isScanning ? 'Stop scan' : 'Start scan',
    },
    {
      title: connectedDevice ? 'Connected to device' : 'Connect to a device',
      desc: connectedDevice
        ? `${connectedDevice.name ?? connectedDevice.localName ?? 'Peripheral'} is ready.`
        : 'Tap a device from the list below to connect.',
      icon: 'link-outline' as const,
      done: Boolean(connectedDevice),
    },
    {
      title: color ? 'Receiving data' : 'Subscribe to notifications',
      desc: color ? `Latest value: ${color}` : 'Live data starts once connected.',
      icon: 'pulse-outline' as const,
      done: Boolean(color),
    },
  ];

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 36 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingHorizontal: Spacing.xl }]}> 
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Bluetooth Connection Wizard</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Scan, connect, and subscribe to your VEST device.
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}> 
            <Ionicons name="build-outline" size={14} color={colors.primary} />
            <Text style={[styles.pillText, { color: colors.primary }]}>Dev build required</Text>
          </View>
        </View>

        <View style={{ gap: Spacing.md, paddingHorizontal: Spacing.xl }}>
          <GlassCard>
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Mental model</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: FontSizes.subhead }}>
                BLE flow: Central → scan → connect → discover services/characteristics → subscribe to Notify.
              </Text>
              <View style={styles.badgeRow}>
                {mentalModel.map((item) => (
                  <View
                    key={item.title}
                    style={[
                      styles.badge,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                    ]}
                  >
                    <Ionicons name={item.icon} size={16} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.badgeTitle, { color: colors.foreground }]}>{item.title}</Text>
                      <Text style={[styles.badgeDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>

          <GlassCard>
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Connection checklist</Text>
              <View style={{ gap: Spacing.xs }}>
                {checklist.map((step) => (
                  <View key={step.title} style={[styles.stepRow, { borderColor: colors.border }]}> 
                    <View style={[styles.stepIcon, { backgroundColor: step.done ? colors.primary : 'transparent', borderColor: colors.border }]}> 
                      {step.done ? (
                        <Ionicons name="checkmark" size={16} color={colors.primaryForeground} />
                      ) : (
                        <Ionicons name={step.icon} size={16} color={colors.primary} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                      <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
                    </View>
                    {step.action && (
                      <Pressable
                        onPress={step.action}
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor: step.done ? 'transparent' : colors.primary,
                            borderColor: step.done ? colors.border : 'transparent',
                          },
                        ]}
                        disabled={isConnecting}
                      >
                        {isScanning && step.cta === 'Stop scan' ? (
                          <ActivityIndicator color={colors.primaryForeground} />
                        ) : (
                          <Text
                            style={{
                              color: step.done ? colors.foreground : colors.primaryForeground,
                              fontWeight: '700',
                            }}
                          >
                            {step.cta}
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>

          <GlassCard>
            <View style={{ gap: Spacing.sm }}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Devices nearby</Text>
                {isScanning && <ActivityIndicator color={colors.primary} />}
              </View>
              {allDevices.length === 0 ? (
                <View style={[styles.emptyState, { borderColor: colors.border }]}> 
                  <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground, fontSize: FontSizes.subhead }}>
                    Start a scan to see peripherals.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: Spacing.sm }}>
                  {allDevices.map((device) => (
                    <View key={device.id} style={[styles.deviceRow, { borderColor: colors.border }]}> 
                      <View>
                        <Text style={[styles.deviceName, { color: colors.foreground }]}>
                          {device.name ?? device.localName ?? 'Unknown peripheral'}
                        </Text>
                        <Text style={[styles.deviceMeta, { color: colors.mutedForeground }]}>{device.id}</Text>
                      </View>
                      <Pressable
                        onPress={() => connectToDevice(device)}
                        style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <ActivityIndicator color={colors.primaryForeground} />
                        ) : (
                          <Text style={[styles.connectBtnText, { color: colors.primaryForeground }]}>Connect</Text>
                        )}
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </GlassCard>

          <GlassCard>
            <View style={{ gap: Spacing.md }}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Connection status</Text>
                {connectedDevice ? (
                  <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }]}> 
                    <Ionicons name="ellipse" size={10} color={colors.green400} />
                    <Text style={[styles.statusText, { color: colors.green400 }]}>Connected</Text>
                  </View>
                ) : (
                  <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}> 
                    <Ionicons name="pause-circle-outline" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Idle</Text>
                  </View>
                )}
              </View>

              <View style={[styles.statusRow, { borderColor: colors.border }]}> 
                <Ionicons name="bluetooth" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.foreground }]}>Connected peripheral</Text>
                  <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}> 
                    {connectedDevice?.name ?? connectedDevice?.localName ?? 'Not connected'}
                  </Text>
                </View>
              </View>

              <View style={[styles.statusRow, { borderColor: colors.border }]}> 
                <Ionicons name="color-filter-outline" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.foreground }]}>Live characteristic value</Text>
                  <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}> 
                    {color ? `Decoded color: ${color}` : 'Waiting for notify events…'}
                  </Text>
                </View>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: color ?? 'transparent',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.border,
                  }}
                />
              </View>

              <View style={{ gap: Spacing.xs }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Recent log</Text>
                <View style={[styles.logBox, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}> 
                  {logs.length === 0 ? (
                    <Text style={[styles.logLine, { color: colors.mutedForeground }]}>Actions you take will show up here.</Text>
                  ) : (
                    logs.slice(0, 5).map((entry) => (
                      <Text key={entry.ts} style={[styles.logLine, { color: colors.mutedForeground }]}>
                        · {entry.message}
                      </Text>
                    ))
                  )}
                </View>
              </View>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  title: { fontSize: FontSizes.title1, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: FontSizes.subhead },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
  },
  pillText: { fontSize: FontSizes.caption, fontWeight: '700' },
  cardTitle: { fontSize: FontSizes.title3, fontWeight: '700', letterSpacing: -0.2 },
  badgeRow: { gap: Spacing.xs },
  badge: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  badgeTitle: { fontSize: FontSizes.subhead, fontWeight: '700' },
  badgeDesc: { fontSize: FontSizes.footnote, lineHeight: 18 },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepTitle: { fontSize: FontSizes.subhead, fontWeight: '600' },
  stepDesc: { fontSize: FontSizes.footnote },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyState: {
    minHeight: 80,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  deviceName: { fontSize: FontSizes.subhead, fontWeight: '700' },
  deviceMeta: { fontSize: FontSizes.caption },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  connectBtnText: { fontSize: FontSizes.subhead, fontWeight: '700' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusText: { fontSize: FontSizes.caption, fontWeight: '700' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logBox: {
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 4,
  },
  logLine: { fontSize: FontSizes.footnote },
});
