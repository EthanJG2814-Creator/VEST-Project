import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { DogProfileProvider } from '@/hooks/use-dog-profile';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      primary: Colors.light.primary,
      border: Colors.light.border,
    },
  };

  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      primary: Colors.dark.primary,
      border: Colors.dark.border,
    },
  };

  return (
    <DogProfileProvider>
      <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </DogProfileProvider>
  );
}
