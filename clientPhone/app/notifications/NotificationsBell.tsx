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
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // mejor toque
    >
      <Ionicons name="notifications-outline" size={24} color="#f97316" />

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
    paddingTop: 2,           // 🔥 baja un poquito la campana (ajuste suave)
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    top: -2,                // más alineado con el icono moderno
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,

    // pequeña sombra para que se vea profesional
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
});
