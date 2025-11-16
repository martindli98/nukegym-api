import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NotificationsBell from "@/app/notifications/NotificationsBell";

export default function CustomHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NUKEGYM</Text>
      <NotificationsBell />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 35,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
});
