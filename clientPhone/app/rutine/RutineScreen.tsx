import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@/src/utils/api";
import CreateRoutineModal from "./CreateRoutineModal";
import { requireAuth } from "@/src/utils/authGuard";
import { showError, showSuccess } from "@/src/utils/toast";
import ConfirmModal from "@/components/confirm_modal/ConfirmModal";

import { useMembership } from "@/hooks/useMembership";
import { canSeeRoutines } from "@/src/utils/membershipAccess";

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
interface Student {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

export default function RoutineScreen() {
  const { membership, loading: membershipLoading } = useMembership();

  const [routines, setRoutines] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Rutina | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);
  const [membershipError, setMembershipError] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [showStudents, setShowStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const router = useRouter();

  // PROTECCIÓN DE RUTA
  useFocusEffect(
    React.useCallback(() => {
      requireAuth();
    }, [])
  );

  // CARGA DE USUARIO + RUTINAS
  useFocusEffect(
    useCallback(() => {
      if (membershipLoading) return;

      loadUserAndRoutines();
    }, [membership])
  );

  const loadUserAndRoutines = async () => {
    setLoading(true);
    setError("");
    setMembershipError(null);

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
      if (!membershipLoading && membership) {
        let canView = true;

        if (parsedUser.id_rol !== 1 && parsedUser.id_rol !== 3) {
          canView = membership?.membershipActive === true;
        }

        if (!canView) {
          setMembershipError(
            "No tenés una membresía activa. Mejorá tu plan para ver rutinas. "
          );
          setLoading(false);
          return;
        }
      }
      // 🚀 PEDIDO DE RUTINAS
      const res = await api("/routine/user");

      if (res?.success) {
        setRoutines(res.routines ?? []);
      } else {
        setRoutines([]);
        setError(res?.message ?? "No tienes rutinas asignadas.");
      }
    } catch (err: any) {
      console.error("Error fetching routines:", err.message);

      if (
        err.response?.status === 403 &&
        err.response?.data?.membershipActive === false
      ) {
        setRoutines([]);
        setMembershipError(
          "No tenés una membresía activa. Mejora tu plan para ver rutinas."
        );
        setLoading(false);
        return;
      }

      if (err.response?.status === 401) {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
        setUser(null);
        setRoutines([]);
        setError("Sesión inválida. Por favor inicia sesión de nuevo.");
        setLoading(false);
        return;
      }

      setError("No se pudieron cargar las rutinas.");
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
    if (!user) return;

    try {
      const res = await api(`/trainers/${user.id}/alumnos`);
      setStudents(Array.isArray(res) ? res : []);
    } catch {
      showError("Error al cargar alumnos");
    }
  };

  // ❗ SI NO TIENE MEMBRESÍA — MOSTRAR PANTALLA ESPECIAL
  if (membershipError) {
    return (
      <View style={styles.containerError}>
        <Text style={styles.error}>{membershipError}</Text>

        <TouchableOpacity
          onPress={() => router.push("/membership")}
          style={{
            marginTop: 20,
            backgroundColor: "#6D28D9",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Ver planes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ❗ MOSTRAR RUTINA SELECCIONADA
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

  // ❗ VISTA PARA ENTRENADORES
  if (showStudents) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setShowStudents(false)}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Mis alumnos</Text>

        {students.length === 0 ? (
          <Text style={styles.text}>No tienes alumnos asignados aún.</Text>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.objetivo}>
                  {item.nombre} {item.apellido}
                </Text>
                <Text style={styles.subtext}>{item.email}</Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#6D28D9",
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 10,
                  }}
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
          studentId={selectedStudent ?? 0}
          onClose={() => setSelectedStudent(null)}
          onCreated={() => {
            loadStudents();
            setSelectedStudent(null);
          }}
        />
      </View>
    );
  }

  // ❗ LISTA DE RUTINAS
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Mis rutinas</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Text style={styles.addButton}>＋</Text>
          </TouchableOpacity>

          {user?.id_rol === 3 && (
            <TouchableOpacity
              onPress={() => {
                loadStudents();
                setShowStudents(true);
              }}
            >
              <Text style={styles.addButton}>👥</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.titleRow}>
        <TouchableOpacity onPress={() => router.push("/progress/progressView")}>
          <Text>Ir a Progreso</Text>
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
    paddingVertical: 5,
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
    borderRadius: 5,
    marginVertical: 12,
  },
  objetivo: { fontSize: 18, fontWeight: "bold", color: "#6D28D9", padding: 3 },
  fecha: { color: "gray", marginVertical: 2, paddingHorizontal: 3 },
  subtext: {
    color: "gray",
    fontSize: 13,
    marginBottom: 8,
    paddingHorizontal: 3,
  },
  subtextBox: { flex: 1, color: "gray", fontSize: 14, marginBottom: 2 },
  imageContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    width: "100%",
  },
  exerciseImage: {
    width: "70%",
    height: 180,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  infoBox: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
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
