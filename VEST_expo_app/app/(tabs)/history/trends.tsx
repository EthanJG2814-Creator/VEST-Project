import { View, Text } from 'react-native';

export default function TrendsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Trends Charts</Text>
      <Text>Review long-term trends across saved sessions and alert patterns.</Text>
    </View>
  );
}
