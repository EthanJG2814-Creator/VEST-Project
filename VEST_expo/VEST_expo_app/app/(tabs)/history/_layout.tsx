import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'History' }} />
      <Stack.Screen name="trends" options={{ title: 'Trends Charts' }} />
      <Stack.Screen name="export" options={{ title: 'Export Data' }} />
    </Stack>
  );
}
