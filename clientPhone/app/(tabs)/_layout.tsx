import { Tabs } from 'expo-router';
import React from 'react';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderRadius: 15,
          padding: 5,
          backgroundColor: '#fff',
        }
      }}>
      <Tabs.Screen
        name="membership"
        options={{
          title: 'Membresia',
          tabBarIcon: ({ color, size }) => 
          <Ionicons size={size} name="card-outline" color={color} />,
        }}
      />
       <Tabs.Screen
        name="classes"
        options={{
          title: 'Clases',
          tabBarIcon: ({ color, size }) => 
          <MaterialCommunityIcons size={size} name="calendar-check" color={color} />,
        }}
      />
       <Tabs.Screen
        name="qr"
        options={{
          title: 'QR',
          tabBarIcon: ({ color, size }) => 
          <MaterialCommunityIcons size={size} name="qrcode-scan" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rutine"
        options={{
          title: 'Rutina',
          tabBarIcon: ({ color, size }) => 
          <MaterialCommunityIcons size={size} name="dumbbell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) =>
          <Ionicons size={size} name="person-circle-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
