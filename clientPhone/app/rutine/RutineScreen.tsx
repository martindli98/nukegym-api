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
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@/src/utils/api";
import CreateRoutineModal from "../rutine/CreateRoutineModal";
import { requireAuth } from "@/src/utils/authGuard";
import { showError, showSuccess } from "@/src/utils/toast";
import ConfirmModal from "@/components/confirm_modal/ConfirmModal";
import { Feather } from "@expo/vector-icons";
import AddExercisesModal from "./AddExercisesModal";

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
  const [editMode, setEditMode] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const [showAddExercises, setShowAddExercises] = useState(false);
  const [originalRoutine, setOriginalRoutine] = useState<Rutina | null>(null);

  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [membership, setMembership] = useState<any>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);
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
    setLoadingMembership(true);
    setError("");
    setMembership(null);
    console.log(user);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userDataStr = await AsyncStorage.getItem("userData");

      if (!token || !userDataStr) {
        setUser(null);
        setRoutines([]);
        setMembership({ membershipActive: false, data: {} });
        setLoadingMembership(false);
        setError("Debes iniciar sesión para ver tus rutinas.");
        setLoading(false);
        return;
      }

      const parsedUser: User = JSON.parse(userDataStr);
      setUser(parsedUser);

      // Cargar membresía
      const role = parsedUser.id_rol;
      if (role === 1 || role === 3) {
        setMembership({ membershipActive: true, data: { tipo: "libre" } });
      } else {
        try {
          const res = await api("/membership/status");
          setMembership(res);
        } catch (err) {
          console.error("Error membership:", err);
          setMembership({ membershipActive: false });
        }
      }
      setLoadingMembership(false);

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

  const canViewRoutines = () => {
    if (!user || !membership) return false;
    const rol = user.id_rol;
    const tipo = membership?.data?.tipo;
    const active = membership?.membershipActive;

    if (rol === 1 || rol === 3) return true;
    if (rol === 2 && active && tipo !== 1) return true;
    return false;
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
      console.log(res);
      if (Array.isArray(res)) {
        setStudents(res);
      } else {
        setStudents([]);
      }
    } catch (error) {
      showError("Error al cargar alumnos");
    }
  };

  const updateExerciseField = (
    exerciseId: number,
    field: string,
    value: any
  ) => {
    setSelectedRoutine((prev) => {
      if (!prev) return prev;

      const updated = prev.ejercicios.map((ex) =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      );

      return { ...prev, ejercicios: updated };
    });
  };

  const removeExercise = (exerciseId: number) => {
    setSelectedRoutine((prev) => {
      if (!prev) return prev;

      const updated = prev.ejercicios.filter((ex) => ex.id !== exerciseId);

      return { ...prev, ejercicios: updated };
    });
  };

  const saveRoutineChanges = async () => {
    if (!selectedRoutine) return;

    try {
      // Actualizar nombre/objetivo
      await api(`/routine/${selectedRoutine.id}/name`, {
        method: "PUT",
        body: { objetivo: selectedRoutine.objetivo },
      });

      // Actualizar cada ejercicio
      for (const ex of selectedRoutine.ejercicios) {
        await api(`/routine/${selectedRoutine.id}/exercise/${ex.id}`, {
          method: "PUT",
          body: ex,
        });
      }

      showSuccess("Cambios guardados");
      setEditMode(false);
      loadUserAndRoutines();
    } catch (err) {
      console.log("ERROR PUT ROUTINE:", err);
      showError("No se pudieron guardar los cambios");
    }
  };

  const requestDeleteExercise = (exerciseId: number) => {
    setExerciseToDelete(exerciseId);
    setShowConfirm(true);
  };

  const confirmDeleteExercise = async () => {
    if (!selectedRoutine || !exerciseToDelete) return;

    try {
      await api(`/routine/${selectedRoutine.id}/exercise/${exerciseToDelete}`, {
        method: "DELETE",
      });

      showSuccess("Ejercicio eliminado correctamente");

      setSelectedRoutine((prev) =>
        prev
          ? {
              ...prev,
              ejercicios: prev.ejercicios.filter(
                (ex) => ex.id !== exerciseToDelete
              ),
            }
          : prev
      );
    } catch (error) {
      showError("Error al eliminar el ejercicio");
    } finally {
      setShowConfirm(false);
      setExerciseToDelete(null);
    }
  };

  const fetchRoutineAgain = async () => {
    if (!selectedRoutine) return;

    try {
      const res = await api(`/routine/${selectedRoutine.id}`);

      // El backend devuelve directamente la rutina
      if (res && res.id) {
        setSelectedRoutine(res);
        showSuccess("Ejercicio agregado correctamente");
      } else {
        console.log("Respuesta inesperada:", res);
        showError("No se pudo actualizar la rutina");
      }
    } catch (err) {
      console.error("Error recargando rutina:", err);
      showError("Error al actualizar la rutina");
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
      marginBottom: 2,
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
      paddingVertical: 5,
      paddingHorizontal: 8,
      backgroundColor: "#ef4444",
      borderRadius: 10,
      shadowColor: "#ffffffff",
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 4,
      elevation: isDark ? 4 : 3,
      alignItems: "center",
    },

    deleteText: {
      color: "#ffffffff",
      fontSize: 18,
      fontWeight: "bold",
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
      fontSize: 13,
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
            <TouchableOpacity
              onPress={() => {
                if (editMode && originalRoutine) {
                  setSelectedRoutine(originalRoutine);
                }
                setEditMode(false);
                setOriginalRoutine(null);
                setSelectedRoutine(null);
              }}
            >
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>

            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              {editMode && (
                <>
                  <TouchableOpacity onPress={() => setShowAddExercises(true)}>
                    <Feather name="plus-circle" size={28} color="green" />
                  </TouchableOpacity>

                  <AddExercisesModal
                    visible={showAddExercises}
                    onClose={() => setShowAddExercises(false)}
                    routineId={selectedRoutine?.id}
                    existingExercises={selectedRoutine?.ejercicios || []}
                    onAdded={fetchRoutineAgain}
                  />
                </>
              )}
              {/* BOTÓN EDITAR */}
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: "#f59e0b" }]}
                onPress={() => setEditMode(!editMode)}
              >
                <Feather name="edit" size={24} color="white" />
              </TouchableOpacity>

              {/* BOTÓN ELIMINAR */}
              {editMode && (
                <>
                  <TouchableOpacity
                    onPress={() => requestDeleteRoutine(selectedRoutine.id)}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash" size={24} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {editMode ? (
            <TextInput
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#f97316",
                backgroundColor: isDark ? "#fff5" : "#0002",
                padding: 8,
                borderRadius: 12,
              }}
              value={selectedRoutine.objetivo}
              onChangeText={(text) =>
                setSelectedRoutine((prev) =>
                  prev ? { ...prev, objetivo: text } : prev
                )
              }
            />
          ) : (
            <Text style={styles.title}>{selectedRoutine.objetivo}</Text>
          )}
          {/* <Text style={styles.fecha}>
            Fecha: {new Date(selectedRoutine.fecha).toLocaleDateString()}
          </Text> */}

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
                    {editMode ? (
                      <>
                        <View style={styles.infoBox}>
                          <Text style={styles.infoTitle}>SETS</Text>
                          <TextInput
                            style={[
                              styles.infoValue,
                              {
                                backgroundColor: isDark ? "#fff5" : "#0002",
                                borderRadius: 5,
                                padding: 4,
                              },
                            ]}
                            keyboardType="numeric"
                            value={String(item.series ?? "")}
                            onChangeText={(t) => {
                              // Permitir solo números
                              let value = t.replace(/[^0-9]/g, "");

                              // Máximo 2 dígitos
                              if (value.length > 2) value = value.slice(0, 2);

                              // Evitar 0, cadena vacía o negativos
                              if (value === "" || value === "0") value = "1";

                              updateExerciseField(item.id, "series", value);
                            }}
                          />
                        </View>

                        <View style={styles.infoBox}>
                          <Text style={styles.infoTitle}>REPS</Text>
                          <TextInput
                            style={[
                              styles.infoValue,
                              {
                                backgroundColor: isDark ? "#fff5" : "#0002",
                                borderRadius: 8,
                                padding: 4,
                              },
                            ]}
                            keyboardType="numeric"
                            value={String(item.repeticiones ?? "")}
                            onChangeText={(t) => {
                              let value = t.replace(/[^0-9]/g, "");

                              if (value.length > 2) value = value.slice(0, 2);

                              if (value === "" || value === "0") value = "1";

                              updateExerciseField(
                                item.id,
                                "repeticiones",
                                value
                              );
                            }}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.infoBox}>
                          <Text style={styles.infoValue}>
                            {item.series ?? "-"}
                          </Text>
                          <Text style={styles.infoTitle}>SETS</Text>
                        </View>

                        <View style={styles.infoBox}>
                          <Text style={styles.infoValue}>
                            {item.repeticiones ?? "-"}
                          </Text>
                          <Text style={styles.infoTitle}>REPS</Text>
                        </View>
                      </>
                    )}
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
                  {editMode && (
                    <TouchableOpacity
                      style={{
                        marginTop: 12,
                        backgroundColor: "#ef4444",
                        padding: 10,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                      onPress={() => requestDeleteExercise(item.id)}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Eliminar ejercicio
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
          {editMode && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: "#10B981", marginTop: 15 },
              ]}
              onPress={saveRoutineChanges}
            >
              <Text style={styles.deleteText}>Guardar cambios</Text>
            </TouchableOpacity>
          )}
        </View>
        <ConfirmModal
          visible={showConfirm}
          title={exerciseToDelete ? "Eliminar ejercicio" : "Eliminar rutina"}
          message={
            exerciseToDelete
              ? "¿Seguro que deseas eliminar este ejercicio?"
              : "¿Seguro que deseas eliminar esta rutina?"
          }
          onCancel={() => {
            setShowConfirm(false);
            setRoutineToDelete(null);
            setExerciseToDelete(null);
          }}
          onConfirm={() => {
            exerciseToDelete ? confirmDeleteExercise() : confirmDeleteRoutine();
          }}
        />
      </>
    );
  }

  if (loading || loadingMembership)
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (user?.id_rol === 2 && !canViewRoutines()) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: isDark ? "#111827" : "#f3f4f6",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: "#f97316",
            marginBottom: 10,
          }}
        >
          Membresía insuficiente
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16, color: "#6b7280" }}>
          Tu plan no permite ver rutinas. Actualizá tu membresía para acceder.
        </Text>
      </View>
    );
  }

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
    <View style={styles.container}>
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
          <TouchableOpacity
            onPress={() => router.push("/progress/progressView")}
          >
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
