import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  useColorScheme,
  // Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { useFocusEffect } from "@react-navigation/native";
import { showSuccess, showError } from "@/src/utils/toast";
import ConfirmModal from "@/components/confirm_modal/ConfirmModal";

interface User {
  id: number;
  id_rol: number;
  nombre?: string;
  apellido?: string;
  email: string;
  nro_documento?: string;
  turno: string;
  telefono_personal?: string;
  telefono_emergencia?: string;
  fecha_nacimiento?: string;
  patologias?: string;
}

export default function ProfileView({ onLogout, onEditPress, onProfileTrainer }: any) {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const res = await api("/users/profile");

      if (res.success) {
        setUserData(res.user);
        await AsyncStorage.setItem("userData", JSON.stringify(res.user));
      } else {
        showError("No se pudo obtener el perfil", "Error");
      }
    } catch (err) {
      console.error("Error al cargar el perfil", err);
      showError("No se pudo conectar con el servidor", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userData");
    showSuccess("Has cerrado sesión correctamente", "Sesión cerrada");
    onLogout();
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }

        await fetchProfile();
      };

      loadProfile();
    }, [])
  );

  const styles = StyleSheet.create({
    container: { flex: 1,  backgroundColor: isDark ? "#111827" : "#f3f4f6", padding: 20 },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
    },
    header: { alignItems: "center", marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
    name: { fontSize: 22, fontWeight: "bold", color: isDark ? "#ffffffff" : "#111827" },
    email: { color: "#6b7280" },
    card: {
      backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
      borderRadius: 10,
      padding: 16,
      marginBottom: 20,
      
    },
    info: { fontSize: 16, color: isDark ? "#ffffffff" : "#111827", marginBottom: 8, textTransform: 'capitalize' },
    editButton: {
      backgroundColor: "#f97316",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    editText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
    },
    logoutButton: { backgroundColor: "#6b7280", padding: 12, borderRadius: 8 },
    trainerButton: {
      backgroundColor: "#3b82f6",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    logoutText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#555" }}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {userData.nombre} {userData.apellido}
          </Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.info}>DNI: {userData.nro_documento}</Text>
          <Text style={styles.info}>
            Teléfono personal: {userData.telefono_personal}
          </Text>
          <Text style={styles.info}>
            Teléfono de emergencia: {userData.telefono_emergencia || "-"}
          </Text>
          <Text style={styles.info}>
            Fecha de nacimiento: {userData.fecha_nacimiento || "-"}
          </Text>
          <Text style={styles.info}>
            Turno: {userData.turno}
          </Text>
        </View>
        <TouchableOpacity style={styles.trainerButton} onPress={onProfileTrainer}>
          <Text style={styles.editText}>Entrenador</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
      <ConfirmModal
        visible={showLogoutModal}
        title="Cerrar sesión"
        message="¿Seguro que desea cerrar la sesión?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}
