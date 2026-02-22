import { Redirect } from 'expo-router';

export default function AppLaunch() {
  return <Redirect href="/(auth)/sign-in" />;
}
