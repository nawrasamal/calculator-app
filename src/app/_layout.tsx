import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(dark ? '#000000' : '#F2F2F7');
    void SplashScreen.hideAsync();
  }, [dark]);

  return (
    <ThemeProvider value={dark ? DarkTheme : DefaultTheme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </ThemeProvider>
  );
}
