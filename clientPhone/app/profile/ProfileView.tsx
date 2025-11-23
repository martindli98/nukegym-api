import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  // Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { useFocusEffect } from "@react-navigation/native";
import { showSuccess, showError } from "@/src/utils/toast";
import ConfirmModal from "@/components/confirm_modal/ConfirmModal";

interface User {
  id: number;
  nombre?: string;
  apellido?: string;
  email: string;
  nro_documento?: string;
  turno: string;
  telefono_personal?: string;
  telefono_emergencia?: string;
  fecha_nacimiento?: string;
  patologias?: string;
  id_rol?: number;
}

export default function ProfileView({ onLogout, onEditPress, onProfileTrainer, onProfileStudents }: any) {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const res = await api("/users/profile");

      if (res.success) {
        // Mapear tipo_rol a id_rol
        const getRoleId = (tipoRol: string): number => {
          switch (tipoRol?.toLowerCase()) {
            case "admin":
              return 1;
            case "cliente":
              return 2;
            case "entrenador":
              return 3;
            default:
              return 0;
          }
        };

        const roleId = getRoleId(res.user?.tipo_rol);
        
        const userWithRole = { 
          ...res.user, 
          id_rol: roleId
        };
        
        setUserData(userWithRole);
        setUserRole(roleId);
        await AsyncStorage.setItem("userData", JSON.stringify(userWithRole));
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
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          setUserRole(parsedUser.id_rol || null);
        }

        await fetchProfile();
      };

      loadProfile();
    }, [])
  );

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
        {userRole !== 3 && (
          <TouchableOpacity style={styles.trainerButton} onPress={onProfileTrainer}>
            <Text style={styles.editText}>Entrenador</Text>
          </TouchableOpacity>
        )}

        {userRole === 3 && (
          <TouchableOpacity style={styles.studentsButton} onPress={onProfileStudents}>
            <Text style={styles.editText}>Alumnos</Text>
          </TouchableOpacity>
        )}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 20 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  header: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "bold", color: "#1f2937" },
  email: { color: "#6b7280" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  info: { fontSize: 16, color: "#374151", marginBottom: 8, textTransform: 'capitalize' },
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
  studentsButton: {
    backgroundColor: "#6D28D9",
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
