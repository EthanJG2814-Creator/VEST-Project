import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Settings</Text>
      <Text>Manage app preferences, device details, and update options.</Text>
      <Button title="Open Device Info" onPress={() => router.push('/(tabs)/settings/device-info')} />
      <Button title="Open Firmware Updates" onPress={() => router.push('/(tabs)/settings/firmware-updates')} />
    </View>
  );
}
