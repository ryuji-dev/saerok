import { Tabs } from 'expo-router';
import { BookOpen, Camera, Map, UserRound } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '도감',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <BookOpen color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: '지도', tabBarIcon: ({ color, size }) => <Map color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="camera"
        options={{ title: '촬영', tabBarIcon: ({ color, size }) => <Camera color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: '프로필', tabBarIcon: ({ color, size }) => <UserRound color={color as string} size={size} /> }}
      />
    </Tabs>
  );
}
