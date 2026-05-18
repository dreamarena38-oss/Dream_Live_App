import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { enableScreens } from 'react-native-screens';
import apiClient from '@/lib/api';

// Disable native screens to prevent crashes on Android
enableScreens(false);

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {

  useFrameworkReady();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    // Using system fonts as fallback to avoid loading issues
  });

  // We'll use a global constant or just rely on system fonts for now
  // to ensure maximum stability as requested.
  const customFont = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

  useEffect(() => {
    // Set up global redirection for unauthorized requests
    apiClient.setOnTokenExpired(() => {
      console.log('🚪 Token expired, redirecting to login');
      router.replace('/admin/login');
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ErrorBoundary>
      <StatusBar style="light" />
      <Toast position="top" topOffset={60} />
    </SafeAreaProvider>
  );
}