// app/progress/progressView.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { api } from "@/src/utils/api";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { showSuccess, showError } from "@/src/utils/toast";

// TIPOS -------------------------

interface Ejercicio {
  id: number;
  nombre: string;
  series: number;
  repeticiones: number;
}

interface Rutina {
  id: number;
  objetivo: string;
  ejercicios: Ejercicio[];
}

export default function ProgressView() {
  const [routines, setRoutines] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // FETCH -------------------------
  const fetchRoutines = async () => {
    try {
      const res = await api("/progress/routine");

      if (res.success) {
        setRoutines(res.routines);
      } else {
        showError(res.message || "Error al obtener rutinas", "Error");
      }
    } catch (err) {
      console.log(err);
      showError("No se pudo conectar con el servidor", "Error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
    }, [])
  );

  // GUARDAR -------------------------
  const handleSave = async (routine: Rutina, formValues: any) => {
    try {
      const progresos = routine.ejercicios.map((ej) => ({
        id_ejercicio: ej.id,
        peso: Number(formValues[`peso_${ej.id}`] || 0),
        repeticiones: ej.repeticiones || 0,
      }));

      const res = await api("/progress/add", {
        method: "POST",
        body: {
          id_rutina: routine.id,
          progresos,
        },
      });

      if (res.success) showSuccess("Progreso guardado", "Éxito");
      else showError(res.message || "No se pudo guardar", "Error");
    } catch (err) {
      console.log(err);
      showError("Error en el servidor", "Error");
    }
  };

  // LOADING -------------------------
  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // UI -------------------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progreso de Entrenamiento</Text>

      {routines.map((routine, index) => {
        const formValues: any = {};

        return (
          <View key={routine.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              Rutina {index + 1} – {routine.objetivo}
            </Text>

            {routine.ejercicios?.map((ej) => (
              <View key={ej.id} style={styles.exerciseBox}>
                <Text style={styles.exerciseName}>{ej.nombre}</Text>
                <Text>Series: {ej.series}</Text>
                <Text>Reps: {ej.repeticiones}</Text>

                <TextInput
                  placeholder="Peso (kg)"
                  keyboardType="numeric"
                  onChangeText={(v) => (formValues[`peso_${ej.id}`] = v)}
                  style={styles.input}
                />
              </View>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.btnBlue]}
                onPress={() =>
                  router.push({
                    pathname: "/progress/progressComplete",
                    params: { idRutina: routine.id },
                  })
                }
              >
                <Text style={styles.buttonText}>Ver progreso</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.btnGreen]}
                onPress={() => handleSave(routine, formValues)}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f3f4f6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  exerciseBox: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseName: { fontSize: 16, fontWeight: "600" },
  input: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    width: "48%",
  },
  btnBlue: { backgroundColor: "#2563eb" },
  btnGreen: { backgroundColor: "#16a34a" },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
});
