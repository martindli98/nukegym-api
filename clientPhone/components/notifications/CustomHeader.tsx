import React from "react";
import { View, Text, StyleSheet , useColorScheme,} from "react-native";
import NotificationsBell from "@/app/notifications/NotificationsBell";

export default function CustomHeader() {
  const theme = useColorScheme();
    const isDark = theme === "dark";
    const styles = StyleSheet.create({
  container: {
    height: 35,
    backgroundColor: isDark ? "#1f2937" : "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#11161dff" : "#f3f4f6",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: isDark ? "#ffffffff" : "#111827",
  },
});
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NUKEGYM</Text>
      <NotificationsBell />
    </View>
  );
}


