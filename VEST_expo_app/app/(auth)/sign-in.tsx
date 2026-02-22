import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function SignInScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign In / Select Dog Profile</Text>
      <Button
        title="Continue to App"
        onPress={() => router.replace('/(tabs)/home')}
      />
    </View>
  );
}
