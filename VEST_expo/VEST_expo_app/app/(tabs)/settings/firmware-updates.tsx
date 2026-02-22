import { View, Text } from 'react-native';

export default function FirmwareUpdatesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Firmware Updates</Text>
      <Text>Check current firmware version and available update status.</Text>
    </View>
  );
}
