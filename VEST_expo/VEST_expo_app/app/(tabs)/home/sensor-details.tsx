import { View, Text } from 'react-native';

export default function SensorDetailsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Sensor Details</Text>
      <Text>Inspect per-sensor metrics, status, and recent values.</Text>
    </View>
  );
}
