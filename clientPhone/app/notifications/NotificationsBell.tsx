import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationsBell() {
  const router = useRouter();
  const { notifications } = useNotifications();

  const unread = notifications?.filter(n => !n.leida).length ?? 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/notifications/NotificationsScreen")}
    >
      <Ionicons name="notifications-outline" size={22} color="#f97316" />

      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
       // 🔥 baja un poquito la campana
  },
  badge: {
    position: "absolute",
    top: 0,
    right: -4,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 0,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
