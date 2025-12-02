import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { showError, showSuccess } from "@/src/utils/toast";

interface Exercise {
  id: number;
  nombre: string;
  musculo_principal: string;
  url_media?: string;
}

interface SelectedExercise {
  id_ejercicio: number;
  nombre: string;
  series: number;
  repeticiones: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  studentId: number;
  trainerId?: number | null;
}

export default function CreateRoutineModal({
  visible,
  onClose,
  onCreated,
  studentId,
  trainerId = null,
}: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExercise[]
  >([]);
  const [filter, setFilter] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const resetState = () => {
    setName("");
    setFilter("");
    setExercises([]);
    setFiltered([]);
    setSelectedExercises([]);
  };

  useEffect(() => {
    if (visible) {
      loadExercises();
    } else {
      resetState();
    }
  }, [visible]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        showError("Por favor inicia sesión nuevamente.", "Sesión expirada");
        // Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
        onClose();
        return;
      }

      const res = await api("/exercises");

      if (Array.isArray(res)) {
        setExercises(res);
        setFiltered(res);
      } else {
        showError("Los datos recibidos no son válidos.", "Error");
        // Alert.alert("Error", "Los datos recibidos no son válidos.");
      }
    } catch (err: any) {
      console.error(
        "Error cargando ejercicios:",
        err.response?.data || err.message
      );
      if (err.response?.status === 401) {
        showError("Por favor inicia sesión nuevamente.", "Sesión expirada");
        // Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
        onClose();
      } else {
        showError("No se pudieron cargar los ejercicios", "Error");
        // Alert.alert("Error", "No se pudieron cargar los ejercicios");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const f = exercises.filter(
      (ex) =>
        ex.musculo_principal?.toLowerCase().includes(filter.toLowerCase()) ||
        ex.nombre?.toLowerCase().includes(filter.toLowerCase())
    );
    setFiltered(f);
  }, [filter, exercises]);

  const toggleExercise = (ex: Exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.id_ejercicio === ex.id);
      if (exists) return prev.filter((e) => e.id_ejercicio !== ex.id);
      return [
        ...prev,
        { id_ejercicio: ex.id, nombre: ex.nombre, series: 3, repeticiones: 12 },
      ];
    });
  };

  const updateField = (
    id: number,
    field: "series" | "repeticiones",
    value: string
  ) => {
    const num = Number(value);
    if (isNaN(num)) return;
    setSelectedExercises((prev) =>
      prev.map((e) => (e.id_ejercicio === id ? { ...e, [field]: num } : e))
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      // showError("Debes ingresar un nombre para la rutina", "Error")
      Alert.alert("Error", "Debes ingresar un nombre para la rutina");
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Selecciona al menos un ejercicio");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
        onClose();
        return;
      }

      await api("/routine", {
        method: "POST",
        body: JSON.stringify({
          id_usuario: studentId,
          id_entrenador: trainerId || null,
          fecha: new Date(),
          objetivo: name.trim(),
          ejercicios: selectedExercises.map((ex) => ({
            id_ejercicio: ex.id_ejercicio,
            series: ex.series,
            repeticiones: ex.repeticiones,
          })),
        }),
      });
      showSuccess("Rutina creada correctamente", "Éxito");
      // Alert.alert("✅ Éxito", "Rutina creada correctamente");
      onCreated();
      onClose();
      resetState();
    } catch (err: any) {
      console.error("Error creando rutina:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
        onClose();
      } else {
        Alert.alert("Error", "No se pudo crear la rutina");
      }
    }
  };
  const styles = StyleSheet.create({
    /* CONTENEDOR ----------------------------- */
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
    },

    /* TITULO -------------------------------- */
    title: {
      fontSize: 26,
      fontWeight: "800",
      marginBottom: 20,
      textAlign: "center",
      color: "#f97316",
    },

    /* INPUT -------------------------------- */
    input: {
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#111827",
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#cbd5e1",
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      fontSize: 16,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.25 : 0.1,
      shadowRadius: 4,
      elevation: isDark ? 4 : 2,
    },

    /* CARD DE EJERCICIO --------------------- */
    exerciseCard: {
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#e2e8f0",
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.35 : 0.1,
      shadowRadius: 6,
      elevation: isDark ? 6 : 3,
    },

    exerciseSelected: {
      borderColor: "#f97316",
      backgroundColor: isDark ? "#30425fff" : "#f5f3ff",
    },

    image: {
      width: "100%",
      height: 170,
      borderRadius: 14,
      marginBottom: 12,
    },

    exerciseName: {
      fontSize: 20,
      fontWeight: "700",
      color: isDark ? "#f8fafc" : "#1e293b",
    },
    muscle: {
      fontSize: 14,
      fontWeight: "300",
      color: isDark ? "#9aa0a6" : "#6c6c6c",
    },
    muscleBadge: {
      alignSelf: "flex-start",
      backgroundColor: isDark ? "#334155" : "#e2e8f0",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,
      marginTop: 6,
      marginBottom: 12,
    },

    muscleBadgeText: {
      color: isDark ? "#cbd5e1" : "#475569",
      fontWeight: "600",
      fontSize: 13,
    },

    /* INPUTS CHICOS ------------------------- */
    smallInputContainer: {
      backgroundColor: isDark ? "#1e293b" : "#f8fafc",
      borderRadius: 12,
      padding: 10,
      width: 100,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#cbd5e1",
      alignItems: "center",
    },

    smallInputLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#cbd5e1" : "#475569",
      marginBottom: 6,
    },

    smallInput: {
      width: "100%",
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      borderRadius: 10,
      padding: 8,
      textAlign: "center",
      borderWidth: 1,
      borderColor: isDark ? "#475569" : "#cbd5e1",
      color: isDark ? "#e2e8f0" : "#1e293b",
    },

    /* FOOTER BOTONES ------------------------ */
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },

    button: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      marginHorizontal: 6,
      alignItems: "center",
    },

    cancel: {
      backgroundColor: "#f97316",
    },

    save: {
      backgroundColor: "#6D28D9",
    },

    buttonText: {
      color: "#ffffff",
      fontWeight: "700",
      fontSize: 16,
    },
  });

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Crear Rutina</Text>

        <TextInput
          placeholder="Ej: Día 1 - Pecho y Tríceps"
          placeholderTextColor={isDark ? "#9aa0a6" : "#6c6c6c"}
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Filtrar por nombre o músculo"
          placeholderTextColor={isDark ? "#9aa0a6" : "#6c6c6c"}
          style={styles.input}
          value={filter}
          onChangeText={setFilter}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#6D28D9" />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {filtered.map((ex) => {
              const selected = selectedExercises.some(
                (e) => e.id_ejercicio === ex.id
              );
              return (
                <TouchableOpacity
                  key={ex.id}
                  style={[
                    styles.exerciseCard,
                    selected && styles.exerciseSelected,
                  ]}
                  onPress={() => toggleExercise(ex)}
                >
                  {ex.url_media ? (
                    <Image
                      source={{ uri: ex.url_media }}
                      style={styles.image}
                    />
                  ) : null}
                  <Text style={styles.exerciseName}>{ex.nombre}</Text>
                  <Text style={styles.muscle}>{ex.musculo_principal}</Text>

                  {selected && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 14,
                      }}
                    >
                      <View style={styles.smallInputContainer}>
                        <Text style={styles.smallInputLabel}>Series</Text>
                        <TextInput
                          keyboardType="numeric"
                          style={styles.smallInput}
                          value={
                            selectedExercises
                              .find((e) => e.id_ejercicio === ex.id)
                              ?.series.toString() || "3"
                          }
                          onChangeText={(v) => updateField(ex.id, "series", v)}
                        />
                      </View>

                      <View style={styles.smallInputContainer}>
                        <Text style={styles.smallInputLabel}>Reps</Text>
                        <TextInput
                          keyboardType="numeric"
                          style={styles.smallInput}
                          value={
                            selectedExercises
                              .find((e) => e.id_ejercicio === ex.id)
                              ?.repeticiones.toString() || "12"
                          }
                          onChangeText={(v) =>
                            updateField(ex.id, "repeticiones", v)
                          }
                        />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              onClose();
              resetState();
            }}
            style={[styles.button, styles.cancel]}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.button, styles.save]}
          >
            <Text style={styles.buttonText}>Guardar rutina</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
