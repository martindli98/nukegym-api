import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileLogin from "./ProfileLogin";
import ProfileView from "./ProfileView";
import ProfileRegister from "./ProfileRegister";
import ProfileEdit from "./ProfileEdit";
import ProfileTrainer from "./ProfileTrainer";
import ProfileStudent from "./ProfileStudent";

export default function ProfileScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showTrainer, setShowTrainer] = useState(false);
  const [showStudents, setShowStudents] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const storedToken = await AsyncStorage.getItem("authToken");
      setToken(storedToken);
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!token) {
    return showRegister ? (
      <ProfileRegister onBack={() => setShowRegister(false)} />
    ) : (
      <ProfileLogin
        onRegisterPress={() => setShowRegister(true)}
        onLoginSuccess={async () => {
          const t = await AsyncStorage.getItem("authToken");
          setToken(t);
        }}
      />
    );
  }

  if (showEdit) {
    return (
      <ProfileEdit
        onCancel={() => setShowEdit(false)}
        onSave={() => {
          setShowEdit(false);
        }}
      />
    );
  }

  if (showTrainer) {
    return <ProfileTrainer onBack={() => setShowTrainer(false)} />;
  }

  if (showStudents) {
    return <ProfileStudent onBack={() => setShowStudents(false)} />;
  }

  return (
    <ProfileView
      onLogout={() => setToken(null)}
      onEditPress={() => setShowEdit(true)}
      onProfileTrainer={() => setShowTrainer(true)}
      onProfileStudents={() => setShowStudents(true)}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
});
