import { View, Text } from 'react-native';

export default function DeviceInfoScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Device Info</Text>
      <Text>See model, serial number, battery state, and connection status.</Text>
    </View>
  );
}
