import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="device-info" options={{ title: 'Device Info' }} />
      <Stack.Screen name="firmware-updates" options={{ title: 'Firmware Updates' }} />
    </Stack>
  );
}
