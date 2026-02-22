import { Stack } from 'expo-router';

export default function ConnectLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Connect to Device' }} />
      <Stack.Screen name="bluetooth-wizard" options={{ title: 'Bluetooth Connection Wizard' }} />
    </Stack>
  );
}
