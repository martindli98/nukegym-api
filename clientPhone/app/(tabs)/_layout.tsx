import { Tabs } from "expo-router";
import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { HapticTab } from "@/components/haptic-tab";
import { useNotifications } from "@/hooks/use-notifications";

export default function TabLayout() {
  // Activar el polling de notificaciones desde el inicio de la app
  useNotifications();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="membership"
        options={{
          title: "Membresia",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="card-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: "Clases",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              size={size}
              name="calendar-check"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: "QR",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              size={size}
              name="qrcode-scan"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notificaciones",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="notifications-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rutine"
        options={{
          title: "Rutina",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons size={size} name="dumbbell" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="person-circle-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
