import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="branch/new" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="branch/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="branch/edit/[id]" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="room/new" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="room/edit/[id]" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="room/[id]/utility" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="room/[id]/payment" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
