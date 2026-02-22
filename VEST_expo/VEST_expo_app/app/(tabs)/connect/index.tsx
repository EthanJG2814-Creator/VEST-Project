import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function ConnectScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Connect to Device</Text>
      <Text>Start pairing and connection setup for the collar hardware.</Text>
      <Button title="Open Bluetooth Wizard" onPress={() => router.push('/(tabs)/connect/bluetooth-wizard')} />
    </View>
  );
}
