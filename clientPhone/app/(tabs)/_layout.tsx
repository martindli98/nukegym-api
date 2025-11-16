import { Tabs } from "expo-router";
import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { HapticTab } from "@/components/haptic-tab";
import CustomHeader from "@/components/notifications/CustomHeader";

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarButton: HapticTab,

        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 8,
          height: 60,
          paddingBottom: 5,
          paddingTop: 2,
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
