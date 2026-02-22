import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function HistoryScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>History</Text>
      <Text>Browse previous sessions and historical health snapshots.</Text>
      <Button title="Open Trends Charts" onPress={() => router.push('/(tabs)/history/trends')} />
      <Button title="Open Export Data" onPress={() => router.push('/(tabs)/history/export')} />
    </View>
  );
}
