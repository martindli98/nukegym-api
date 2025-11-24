import React, { useState, useCallback, use } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
   useColorScheme,
  // Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@/src/utils/api";
import CreateRoutineModal from "../rutine/CreateRoutineModal";
import { requireAuth } from "@/src/utils/authGuard";
import { showError, showSuccess } from "@/src/utils/toast";
import ConfirmModal from "@/components/confirm_modal/ConfirmModal";


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
  const [showConfirm, setShowConfirm] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);
  const router = useRouter();


  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const theme = useColorScheme();
  const isDark = theme === "dark";


  // const router = useRouter();

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
    console.log(user)
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

  const requestDeleteRoutine = (id: number) => {
    setRoutineToDelete(id);
    setShowConfirm(true);
  };

  const confirmDeleteRoutine = async () => {
    if (!routineToDelete) return;

    try {
      await api(`/routine/${routineToDelete}`, { method: "DELETE" });
      showSuccess("Rutina eliminada correctamente");
      setSelectedRoutine(null);

      await loadUserAndRoutines();
    } catch {
      showError("Error al eliminar la rutina");
    } finally {
      setShowConfirm(false);
      setRoutineToDelete(null);
    }
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

  const loadStudents = async () => {
  try {
    const res = await api(`/trainers/${user.id}/alumnos`);
    console.log(res)
    if (Array.isArray(res)) {
      setStudents(res);
    } else {
      setStudents([]);
    }

  } catch (error) {
    showError("Error al cargar alumnos");
  }
};

const styles = StyleSheet.create({
  /* ----------------------- CONTENEDOR ------------------------- */
  container: { 
    flex: 1, 
    backgroundColor: isDark ? "#111827" : "#f3f4f6",
    padding: 14,
  },

  /* ----------------------- HEADER ------------------------- */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  backText: {
    color: isDark ? "#ffffffff" : "#111827",
    fontWeight: "600",
    fontSize: 17,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.4 : 0.08,
    shadowRadius: 3,
    elevation: isDark ? 4 : 2,
  },

  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    shadowColor: "#ffffffff",
    shadowOpacity: isDark ? 0.4 : 0.1,
    shadowRadius: 4,
    elevation: isDark ? 4 : 3,
  },

  deleteText: { 
    color: "#ffffffff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  /* ----------------------- TITULOS ------------------------- */
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: isDark ? "#f97316" : "#f97316",
  },

  fecha: { 
    color: isDark ? "#9ca3af" : "#6b7280",
    fontSize: 15,
    marginBottom: 10,
  },

  text: { 
    fontSize: 15,
    color: isDark ? "#d1d5db" : "#6b7280",
    textAlign: "center",
    marginTop: 12,
  },

  addButton: {
    fontSize: 30,
    color: isDark ? "#f97316" : "#f97316",
    fontWeight: "bold",
    backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 3,
    elevation: isDark ? 4 : 2,
  },

  /* ----------------------- CARDS ------------------------- */
  card: {
    backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.4 : 0.08,
    shadowRadius: 8,
    elevation: isDark ? 5 : 3,
  },

  objetivo: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: isDark ? "#ffffffff" : "#000000ff",
    marginBottom: 4,
  },

  subtext: {
    color: isDark ? "#9ca3af" : "#6b7280",
    fontSize: 14,
    marginBottom: 10,
  },

  /* ----------------------- EJERCICIO DETALLE ------------------------- */
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },

  exerciseImage: {
    width: "92%",
    height: 200,
    borderRadius: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  infoBox: {
    flex: 1,
    backgroundColor: isDark ? "#111827" : "#edededff",
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 3,
    elevation: isDark ? 4 : 2,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#f97316" : "#f97316",
  },

  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: isDark ? "#e5e7eb" : "#333",
    marginBottom: 4,
  },

  expandButton: {
    marginTop: 14,
    backgroundColor: isDark ? "#f97316" : "#f97316",
    borderRadius: 10,
    padding: 12,
    alignSelf: "center",
  },

  expandText: {
    color: isDark ? "#ffffffff" : "#ffffffff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 15,
  },

  descriptionContainer: {
    marginTop: 12,
    backgroundColor: isDark ? "#111827" : "#f3f4f6",
    padding: 12,
    borderRadius: 12,
  },

  descriptionText: {
    fontSize: 14,
    color: isDark ? "#d1d5db" : "#444",
    marginBottom: 6,
    lineHeight: 20,
  },
});


  if (selectedRoutine) {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setSelectedRoutine(null)}>
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => requestDeleteRoutine(selectedRoutine.id)}
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
        <ConfirmModal
          visible={showConfirm}
          title="Eliminar rutina"
          message="¿Seguro que deseas eliminar esta rutina?"
          onCancel={() => {
            setShowConfirm(false);
            setRoutineToDelete(null);
          }}
          onConfirm={confirmDeleteRoutine}
        />
      </>
    );
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (showStudents) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowStudents(false)}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 20 }]}>Mis alumnos</Text>


      {students.length === 0 ? (
        <Text style={styles.text}>No tienes alumnos asignados aún.</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.objetivo}>{item.nombre} {item.apellido}</Text>
              <Text style={styles.subtext}>{item.email}</Text>

              <TouchableOpacity
                style={{ backgroundColor: "#6D28D9", padding: 10, borderRadius: 5, marginTop: 10 }}
                onPress={() => setSelectedStudent(item.id)}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Asignar rutina
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <CreateRoutineModal
        visible={!!selectedStudent}
        studentId={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onCreated={() => {
          loadStudents();
          setSelectedStudent(null);
        }}
      />
    </View>
  );
}

  return (
    <View  style={styles.container}>
      <View style={styles.titleRow}>
          <Text style={styles.title}>Mis rutinas</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <Text style={styles.addButton}>＋</Text>
            </TouchableOpacity>

            {user?.tipo_rol === "entrenador" && (
              <TouchableOpacity
                onPress={() => {
                  loadStudents();
                  setShowStudents(true);
                }}
              >
                <Text style={styles.addButton}>👥</Text>
              </TouchableOpacity>
            )}

            {/* 👉 Nuevo botón: mismo estilo */}
            <TouchableOpacity onPress={() => router.push("/progress/progressView")}>
              <Text style={styles.addButton}>📊</Text>
            </TouchableOpacity>
          </View>
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