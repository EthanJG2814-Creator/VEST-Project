import { Button, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function RecommendationsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Recommendations</Text>
      <Text>See suggested care actions based on the selected alert.</Text>
      <Button title="Go to Share / Vet Share" onPress={() => router.push('/(tabs)/home/share-vet')} />
    </View>
  );
}
