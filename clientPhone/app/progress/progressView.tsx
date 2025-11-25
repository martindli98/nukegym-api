// app/progress/progressView.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme
} from "react-native";
import { api } from "@/src/utils/api";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, Stack } from "expo-router";
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
  const theme = useColorScheme();
  const isDark = theme === "dark";


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

  const styles = StyleSheet.create({
  /* CONTENEDOR --------------------------- */
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: isDark ? "#111827" : "#f3f4f6",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* TITULO ------------------------------- */
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    color: isDark ? "#f97316" : "#f97316",
    textAlign: "center",
  },

  /* CARD ------------------------------- */
  card: {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.45 : 0.12,
    shadowRadius: 6,
    elevation: isDark ? 6 : 3,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: isDark ? "#e5e7eb" : "#111827",
  },

  /* EJERCICIO BOX ------------------------ */
  exerciseBox: {
    backgroundColor: isDark ? "#111827" : "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.25 : 0.06,
    shadowRadius: 4,
    elevation: isDark ? 3 : 1,
  },

  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
    color: isDark ? "#f97316" : "#f97316",
    marginBottom: 4,
  },
  exerciseInf:{
    fontSize: 13,
    fontWeight: "700",
    color: isDark ? "#9ca3af" : "#6b7280",
    marginBottom: 4,
  },

  /* INPUT ------------------------------- */
  input: {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: isDark ? "#374151" : "#d1d5db",
    color: isDark ? "#e5e7eb" : "#111827",
    marginTop: 8,
    
  },

  /* BOTONES ----------------------------- */
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: "48%",
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.35 : 0.1,
    shadowRadius: 4,
    elevation: isDark ? 5 : 2,
  },

  btnBlue: {
    backgroundColor: isDark ? "#2563eb" : "#2563eb",
  },

  btnGreen: {
    backgroundColor: isDark ? "#16a34a" : "#16a34a",
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});


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
  <>
    <Stack.Screen
      options={{
        title: "Progresos",
      }}
    />

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
                <Text style={styles.exerciseInf}>Series: {ej.series}</Text>
                <Text style={styles.exerciseInf}>Reps: {ej.repeticiones}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Peso (kg)"
                  placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                  keyboardType="numeric"
                  onChangeText={(v) => (formValues[`peso_${ej.id}`] = v)}
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
  </>
);

}

