import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function HomeLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="live-alerts" />
      <Stack.Screen
        name="alert-details"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="recommendations" />
      <Stack.Screen name="share-vet" />
      <Stack.Screen name="live-data" />
      <Stack.Screen name="sensor-graphs" />
      <Stack.Screen name="sensor-details" />
    </Stack>
  );
}
