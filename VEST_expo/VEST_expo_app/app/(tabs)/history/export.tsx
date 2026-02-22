import { View, Text } from 'react-native';

export default function ExportScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Export Data</Text>
      <Text>Create shareable reports from stored health and sensor records.</Text>
    </View>
  );
}
