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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@/src/utils/api";
import CreateRoutineModal from "../rutine/CreateRoutineModal";
import { requireAuth } from "@/src/utils/authGuard";
import { showError, showSuccess } from "@/src/utils/toast";

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
    React.useCallback(() => {
      requireAuth();
    }, [])
  );

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

      const res = await api("/routine/user");

      if (res?.success) {
        setRoutines(res.routines ?? []);
      } else {
        setRoutines([]);
        setError(res?.message ?? "No tienes rutinas asignadas.");
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
              await api(`/routine/${id}`, { method: "DELETE" });
              showSuccess("Rutina eliminada correctamente")
              // Alert.alert("Rutina eliminada correctamente");
              setSelectedRoutine(null);
              loadUserAndRoutines();
            } catch {
              showError("Error al eliminar la rutina")
              // Alert.alert("Error al eliminar la rutina");
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
            <Text style={styles.backText}>Volver</Text>
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

  // if (error)
  //   return (
  //     <View style={styles.containerError}>
  //       <Text style={styles.error}>{error}</Text>
  //       <TouchableOpacity>
  //         <Text
  //           style={styles.buttonError}
  //           onPress={() => router.replace("/(tabs)/profile")}
  //         >
  //           Iniciar sesión
  //         </Text>
  //       </TouchableOpacity>
  //     </View>
  //   );

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Mis rutinas</Text>
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
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 10 },
  containerError: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6D28D9",
    paddingVertical: 5
  },
  addButton: {
    fontSize: 26,
    color: "#6D28D9",
    fontWeight: "bold",
    marginRight: 2,
  },
  deleteButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#ef4444",
    borderRadius: 4,
  },
  deleteText: { fontSize: 20 },
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
    // padding: 15,
    borderRadius: 5,
    marginVertical: 12,
  },
  objetivo: { fontSize: 18, fontWeight: "bold", color: "#6D28D9", padding: 3},
  fecha: { color: "gray", marginVertical: 2, paddingHorizontal: 3 },
  subtext: { color: "gray", fontSize: 13, marginBottom: 8, paddingHorizontal: 3 },
  subtextBox: { flex: 1, color: "gray", fontSize: 14, marginBottom: 2},
  imageContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    width: "100%"
    // borderRadius: 12,
    // marginVertical: 10,
  },
  exerciseImage: {
    width: "70%",
    height: 180,
    // borderRadius: 8,
  },
  infoRow: {
    // backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-evenly",
    // marginVertical: 10,
  },
  infoBox: {
    // backgroundColor: "#fff",
    // borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
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
    // marginTop: 10,
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#E0D7FF",
    borderRadius: 5,
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
  // buttonError: {
  //   color: "#fff",
  //   fontSize: 18,
  //   textAlign: "center",
  //   fontWeight: "600",
  //   backgroundColor: "#f97316",
  //   padding: 12,
  //   borderRadius: 8,
  // },
  backText: {
    color: "#6D28D9",
    fontWeight: "bold",
    fontSize: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#E0D7FF",
    borderRadius: 4,
  },
});
