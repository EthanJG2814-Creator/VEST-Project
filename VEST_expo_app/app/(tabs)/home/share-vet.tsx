import { View, Text } from 'react-native';

export default function ShareVetScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24 }}>Share with Vet</Text>
      <Text>Prepare a summary to share alerts and context with your veterinarian.</Text>
    </View>
  );
}
