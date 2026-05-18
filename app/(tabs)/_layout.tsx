import { Tabs } from 'expo-router';
import { Chrome as Home, Trophy, Play, Settings } from 'lucide-react-native';
import { Platform, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

type TabBarIconProps = {
  size: number;
  color: string;
};

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#FFFFFF',
    tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
    tabBarStyle: {
      backgroundColor: '#6D28D9',
      borderTopColor: '#6D28D9',
      paddingTop: 8,
      paddingBottom: Platform.select({
        android: 12,
        ios: 24
      }),
      height: Platform.select({
        android: 65,
        ios: 90
      }),
      paddingHorizontal: width > 400 ? width * 0.15 : 8,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      paddingBottom: Platform.select({
        android: 2,
        ios: 0
      }),
      marginTop: 2,
    },
    tabBarIconStyle: {
      marginTop: Platform.select({
        android: 2,
        ios: 0,
      }),
    },
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }: TabBarIconProps) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="leagues"
          options={{
            title: 'Leagues',
            tabBarIcon: ({ size, color }: TabBarIconProps) => (
              <Trophy size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="videos"
          options={{
            title: 'Videos',
            tabBarIcon: ({ size, color }: TabBarIconProps) => (
              <Play size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="highlights"
          options={{
            title: 'Highlights',
            tabBarIcon: ({ size, color }: TabBarIconProps) => (
              <Trophy size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Admin',
            tabBarIcon: ({ size, color }: TabBarIconProps) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}