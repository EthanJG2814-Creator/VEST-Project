import { View, Text } from 'react-native';

export default function BluetoothWizardScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Bluetooth Connection Wizard</Text>
      <Text>Follow pairing steps and verify a stable Bluetooth connection.</Text>
    </View>
  );
}
