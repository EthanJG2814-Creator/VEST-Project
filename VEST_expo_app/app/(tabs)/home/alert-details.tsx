import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function AlertDetailsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Alert Details</Text>
      <Text>Inspect the alert type, time, and associated sensor readings.</Text>
      <Button title="View Recommendations" onPress={() => router.push('/(tabs)/home/recommendations')} />
    </View>
  );
}
