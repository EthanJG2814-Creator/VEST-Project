import { Stack } from 'expo-router';

export default function ConnectLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="bluetooth-wizard" />
    </Stack>
  );
}
