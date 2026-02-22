import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function SensorGraphsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Sensor Graphs</Text>
      <Text>View charted patterns for heart rate, temperature, and motion.</Text>
      <Button title="Open Sensor Details" onPress={() => router.push('/(tabs)/home/sensor-details')} />
    </View>
  );
}
