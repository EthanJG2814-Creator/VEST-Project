import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Home / Dashboard</Text>
      <Text>View live alerts and real-time sensor data from this screen.</Text>
      <Button title="Open Live Alerts" onPress={() => router.push('/(tabs)/home/live-alerts')} />
      <Button title="Open Live Data" onPress={() => router.push('/(tabs)/home/live-data')} />
    </View>
  );
}
