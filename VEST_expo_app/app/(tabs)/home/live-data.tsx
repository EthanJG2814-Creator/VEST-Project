import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function LiveDataScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Live Data</Text>
      <Text>Track current device telemetry and streaming vitals.</Text>
      <Button title="Open Sensor Graphs" onPress={() => router.push('/(tabs)/home/sensor-graphs')} />
    </View>
  );
}
