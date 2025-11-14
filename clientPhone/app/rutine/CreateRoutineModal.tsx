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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";

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
        Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
        onClose();
        return;
      }

      const res = await api('/exercises');

      if (Array.isArray(res)) {
        setExercises(res);
        setFiltered(res);
      } else {
        Alert.alert("Error", "Los datos recibidos no son válidos.");
      }
    } catch (err: any) {
      console.error(
        "Error cargando ejercicios:",
        err.response?.data || err.message
      );
      if (err.response?.status === 401) {
        Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
        onClose();
      } else {
        Alert.alert("Error", "No se pudieron cargar los ejercicios");
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

      await api('/routine', {
        method: 'POST',
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

      Alert.alert("✅ Éxito", "Rutina creada correctamente");
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

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Crear Rutina</Text>

        <TextInput
          placeholder="Ej: Día 1 - Pecho y Tríceps"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Filtrar por nombre o músculo"
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
                    <View>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="Series"
                        style={styles.smallInput}
                        value={
                          selectedExercises
                            .find((e) => e.id_ejercicio === ex.id)
                            ?.series.toString() || "3"
                        }
                        onChangeText={(v) => updateField(ex.id, "series", v)}
                      />
                      <TextInput
                        keyboardType="numeric"
                        placeholder="Repeticiones"
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
            <Text style={styles.buttonText}>Guardar Rutina</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  exerciseSelected: {
    backgroundColor: "#E9D5FF",
    borderColor: "#7C3AED",
  },
  exerciseName: { fontWeight: "bold", fontSize: 16, color: "#333" },
  muscle: { color: "gray", marginBottom: 6 },
  image: { width: "100%", height: 150, borderRadius: 8, marginBottom: 5 },
  smallInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    width: 100,
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancel: { backgroundColor: "#aaa" },
  save: { backgroundColor: "#6D28D9" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
