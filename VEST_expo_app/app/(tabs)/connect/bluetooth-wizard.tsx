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
    disconnectFromDevice,
    connectedDevice,
    sensorData,
    isStreaming,
    isSending,
    sendDataToDevice,
    isBleReady,
    bleUnavailableReason,
    logs,
  } = useBle();

  const handleSendTestPayload = async () => {
    await sendDataToDevice({
      type: 'vest-test-payload',
      sentAt: new Date().toISOString(),
      latestSensorData: sensorData,
      source: 'bluetooth-wizard',
    });
  };

  const truncate = (value: string | null | undefined, max = 22) => {
    if (!value) return 'Unknown peripheral';
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
  };

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
      title: isStreaming ? 'Receiving data' : 'Subscribe to notifications',
      desc: isStreaming
        ? `Latest value: ${sensorData ?? 'Waiting for first packet'}`
        : 'Live data starts once connected.',
      icon: 'pulse-outline' as const,
      done: isStreaming || sensorData !== null,
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
        </View>

        <View style={{ gap: Spacing.md, paddingHorizontal: Spacing.xl }}>
          {!isBleReady && (
            <GlassCard>
              <View
                style={[
                  styles.noticeRow,
                  {
                    borderColor: colors.border,
                    backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.16)',
                  },
                ]}
              >
                <Ionicons name="information-circle-outline" size={18} color={colors.foreground} />
                <Text style={[styles.noticeText, { color: colors.foreground }]}>
                  {bleUnavailableReason ?? 'Bluetooth is unavailable in this environment.'}
                </Text>
              </View>
            </GlassCard>
          )}

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
                        disabled={isConnecting || !isBleReady}
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
                    {isBleReady ? 'Start a scan to see peripherals.' : 'BLE controls are disabled on web preview.'}
                  </Text>
                </View>
              ) : (
                <View style={{ gap: Spacing.sm }}>
                  {allDevices.map((device) => {
                    const isCurrent = connectedDevice?.id === device.id;
                    const displayName = truncate(device.name ?? device.localName, 22);
                    const displayId = truncate(device.id, 28);

                    return (
                      <View key={device.id} style={[styles.deviceRow, { borderColor: colors.border }]}> 
                        <View style={styles.deviceInfo}>
                          <Text
                            style={[styles.deviceName, { color: colors.foreground }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {displayName}
                          </Text>
                          <Text
                            style={[styles.deviceMeta, { color: colors.mutedForeground }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {displayId}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => (isCurrent ? disconnectFromDevice() : connectToDevice(device))}
                          style={[
                            styles.connectBtn,
                            { backgroundColor: isCurrent ? colors.border : colors.primary },
                          ]}
                          disabled={isConnecting || !isBleReady}
                        >
                          {isConnecting ? (
                            <ActivityIndicator color={colors.primaryForeground} />
                          ) : (
                            <Text
                              style={[
                                styles.connectBtnText,
                                { color: isCurrent ? colors.foreground : colors.primaryForeground },
                              ]}
                            >
                              {isCurrent ? 'Disconnect' : 'Connect'}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </GlassCard>

          <GlassCard>
            <View style={{ gap: Spacing.md }}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Connection status</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  {connectedDevice && (
                    <Pressable
                      onPress={handleSendTestPayload}
                      style={[styles.actionBtn, { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: colors.primary, borderColor: 'transparent' }]}
                      disabled={isConnecting || isSending}
                    >
                      {isSending ? (
                        <ActivityIndicator color={colors.primaryForeground} />
                      ) : (
                        <Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>Send test JSON</Text>
                      )}
                    </Pressable>
                  )}
                  {connectedDevice && (
                    <Pressable
                      onPress={disconnectFromDevice}
                      style={[styles.actionBtn, { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'transparent', borderColor: colors.border }]}
                      disabled={isConnecting}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: '700' }}>Disconnect</Text>
                    </Pressable>
                  )}
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
                <Ionicons name="pulse-outline" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, { color: colors.foreground }]}>Live characteristic value</Text>
                  <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}> 
                    {isStreaming
                      ? sensorData ?? 'Waiting for first packet'
                      : 'Waiting for notify events…'}
                  </Text>
                </View>
                <View style={[styles.valuePill, { borderColor: colors.border }]}> 
                  <Text style={[styles.valueText, { color: colors.foreground }]}>{sensorData ?? '--'}</Text>
                </View>
              </View>

              <View style={{ gap: Spacing.xs }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Recent log</Text>
                <View style={[styles.logBox, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}> 
                  {logs.length === 0 ? (
                    <Text style={[styles.logLine, { color: colors.mutedForeground }]}>Actions you take will show up here.</Text>
                  ) : (
                    logs.slice(0, 5).map((entry, idx) => {
                      const logKey = `${entry.ts}-${idx}-${entry.message}`;
                      return (
                        <Text key={logKey} style={[styles.logLine, { color: colors.mutedForeground }]}>
                          · {entry.message}
                        </Text>
                      );
                    })
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
  cardTitle: { fontSize: FontSizes.title3, fontWeight: '700', letterSpacing: -0.2 },
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
  deviceInfo: { flex: 1, marginRight: Spacing.sm },
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
  valuePill: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  valueText: { fontSize: FontSizes.subhead, fontWeight: '700' },
  logBox: {
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 4,
  },
  noticeRow: {
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeText: {
    flex: 1,
    fontSize: FontSizes.footnote,
    fontWeight: '600',
  },
  logLine: { fontSize: FontSizes.footnote },
});
