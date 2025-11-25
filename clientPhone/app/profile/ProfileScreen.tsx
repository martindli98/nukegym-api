import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileLogin from "./ProfileLogin";
import ProfileView from "./ProfileView";
import ProfileRegister from "./ProfileRegister";
import ProfileEdit from "./ProfileEdit";
import ProfileTrainer from "./ProfileTrainer";
import Feedback from "./feedback";

export default function ProfileScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showRegister, setShowRegister] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showTrainer, setShowTrainer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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

  // ────────────────────────────────────────────────────────────────
  // LOGIN / REGISTRO
  // ────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────
  // EDITAR PERFIL
  // ────────────────────────────────────────────────────────────────
  if (showEdit) {
    return (
      <ProfileEdit
        onCancel={() => setShowEdit(false)}
        onSave={() => setShowEdit(false)}
      />
    );
  }

  // ────────────────────────────────────────────────────────────────
  // ENTRENADOR
  // ────────────────────────────────────────────────────────────────
  if (showTrainer) {
    return <ProfileTrainer onBack={() => setShowTrainer(false)} />;
  }

  // ────────────────────────────────────────────────────────────────
  // FEEDBACK
  // ────────────────────────────────────────────────────────────────
  if (showFeedback) {
    return <Feedback onBack={() => setShowFeedback(false)} />;
  }

  // ────────────────────────────────────────────────────────────────
  // PERFIL PRINCIPAL
  // ────────────────────────────────────────────────────────────────
  return (
    <ProfileView
      onLogout={() => setToken(null)}
      onEditPress={() => setShowEdit(true)}
      onProfileTrainer={() => setShowTrainer(true)}
      onFeedback={() => setShowFeedback(true)}
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
