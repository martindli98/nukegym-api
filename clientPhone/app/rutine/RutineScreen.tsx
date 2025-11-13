import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import CreateRoutineModal from "../rutine/CreateRoutineModal";

interface Ejercicio {
  id: number;
  nombre: string;
  musculo_principal?: string;
  series?: number;
  repeticiones?: number;
  descripcion?: string;
  url_media?: string;
}

interface Rutina {
  id: number;
  objetivo: string;
  fecha: string;
  ejercicios: Ejercicio[];
}

interface User {
  id: number;
  nombre?: string;
  email?: string;
  id_rol?: number;
}

export default function RoutineScreen() {
  const [routines, setRoutines] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Rutina | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadUserAndRoutines();
    }, [])
  );

  const loadUserAndRoutines = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userDataStr = await AsyncStorage.getItem("userData");

      if (!token || !userDataStr) {
        setUser(null);
        setRoutines([]);
        setError("Debes iniciar sesión para ver tus rutinas.");
        setLoading(false);
        return;
      }

      const parsedUser: User = JSON.parse(userDataStr);
      setUser(parsedUser);

      const res = await axios.get(
        "http://192.168.100.11:3000/api/routine/user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setRoutines(res.data.routines ?? []);
      } else {
        setRoutines([]);
        setError(res.data?.message ?? "No tienes rutinas asignadas.");
      }
    } catch (err: any) {
      console.error("Error fetching routines:", err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
        setUser(null);
        setRoutines([]);
        setError("Sesión inválida. Por favor inicia sesión de nuevo.");
      } else {
        setError("No se pudieron cargar las rutinas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutine = async (id: number) => {
    Alert.alert(
      "Eliminar rutina",
      "¿Estás seguro de que deseas eliminar esta rutina?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              if (!token) return;
              await axios.delete(
                `http://192.168.100.11:3000/api/routine/${id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Alert.alert("Rutina eliminada correctamente");
              setSelectedRoutine(null);
              loadUserAndRoutines();
            } catch (err) {
              Alert.alert("Error al eliminar la rutina");
            }
          },
        },
      ]
    );
  };

  const formatDescription = (descripcion?: string): string[] => {
    if (!descripcion) return [];
    return descripcion
      .split(".")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (selectedRoutine) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setSelectedRoutine(null)}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteRoutine(selectedRoutine.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{selectedRoutine.objetivo}</Text>
        <Text style={styles.fecha}>
          Fecha: {new Date(selectedRoutine.fecha).toLocaleDateString()}
        </Text>

        <FlatList
          data={selectedRoutine.ejercicios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isExpanded = expanded[item.id];
            const steps = formatDescription(item.descripcion);

            return (
              <View style={styles.card}>
                <Text style={styles.objetivo}>{item.nombre}</Text>
                <Text style={styles.subtext}>
                  Musculo principal: {item.musculo_principal}
                </Text>
                {item.url_media && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.url_media }}
                      style={styles.exerciseImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
                <View style={styles.infoRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoValue}>{item.series ?? "-"}</Text>
                    <Text style={styles.infoTitle}>SETS</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoValue}>
                      {item.repeticiones ?? "-"}
                    </Text>
                    <Text style={styles.infoTitle}>REPS</Text>
                  </View>
                </View>

                {item.descripcion && (
                  <>
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={() => toggleExpand(item.id)}
                    >
                      <Text style={styles.expandText}>
                        {isExpanded
                          ? "Ocultar instrucciones"
                          : "Ver instrucciones"}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.descriptionContainer}>
                        {steps.map((step, index) => (
                          <Text key={index} style={styles.descriptionText}>
                            • {step}.
                          </Text>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          }}
        />
      </View>
    );
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (error)
    return (
      <View style={styles.containerError}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity>
          <Text
            style={styles.buttonError}
            onPress={() => router.replace("/(tabs)/profile")}
          >
            Iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Mis Rutinas</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={styles.addButton}>＋</Text>
        </TouchableOpacity>
      </View>

      {routines.length === 0 ? (
        <Text style={styles.text}>No tienes rutinas asignadas aún.</Text>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedRoutine(item)}
            >
              <Text style={styles.objetivo}>{item.objetivo}</Text>
              <Text style={styles.fecha}>
                Fecha: {new Date(item.fecha).toLocaleDateString()}
              </Text>
              <Text style={styles.subtext}>
                {item.ejercicios?.length ?? 0} ejercicios
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <CreateRoutineModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={loadUserAndRoutines}
        studentId={user?.id ?? 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 20 },
  containerError: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6D28D9",
  },
  addButton: {
    fontSize: 26,
    color: "#6D28D9",
    fontWeight: "bold",
  },
  deleteButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#dc2626",
    borderRadius: 5,
  },
  deleteText: { fontSize: 15 },
  subtitle: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  text: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  error: { fontSize: 16, color: "red", padding: 20 },
  card: {
    backgroundColor: "#e8e8e8",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
  },
  objetivo: { fontSize: 18, fontWeight: "bold", color: "#6D28D9" },
  fecha: { color: "gray", marginTop: 4 },
  subtext: { color: "gray", fontSize: 14, marginBottom: 8 },
  subtextBox: { flex: 1, color: "gray", fontSize: 14 },
  imageContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 35,
    borderRadius: 12,
    marginVertical: 10,
  },
  exerciseImage: {
    width: "90%",
    height: 180,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6D28D9",
  },

  infoValue: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  expandButton: {
    marginTop: 10,
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#E0D7FF",
    borderRadius: 8,
    padding: 10,
  },
  expandText: {
    color: "#6D28D9",
    fontWeight: "bold",
    textAlign: "center",
  },
  descriptionContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  buttonError: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    backgroundColor: "#f97316",
    padding: 12,
    borderRadius: 8,
  },
  backText: {
    color: "#6D28D9",
    fontWeight: "bold",
    fontSize: 20,
  },
});
