import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home / Dashboard' }} />
      <Stack.Screen name="live-alerts" options={{ title: 'Live Alerts' }} />
      <Stack.Screen name="alert-details" options={{ title: 'Alert Details' }} />
      <Stack.Screen name="recommendations" options={{ title: 'Recommendations' }} />
      <Stack.Screen name="share-vet" options={{ title: 'Share with Vet' }} />
      <Stack.Screen name="live-data" options={{ title: 'Live Data' }} />
      <Stack.Screen name="sensor-graphs" options={{ title: 'Sensor Graphs' }} />
      <Stack.Screen name="sensor-details" options={{ title: 'Sensor Details' }} />
    </Stack>
  );
}
