import { useEffect, useCallback } from 'react';
import { Platform, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { enableScreens } from 'react-native-screens';
import apiClient from '@/lib/api';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ErrorBoundary } from '@/components/ErrorBoundary';

enableScreens(Platform.OS !== 'android');

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();

  useEffect(() => {
    apiClient.setOnTokenExpired(() => {
      router.replace('/admin/login');
    });
  }, [router]);

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ErrorBoundary>
        <StatusBar style="light" />
        <Toast position="top" topOffset={60} />
      </View>
    </SafeAreaProvider>
  );
}
