import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="device-info" />
      <Stack.Screen name="privacy-security" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="logout" />
      <Stack.Screen name="firmware-updates" />
    </Stack>
  );
}
