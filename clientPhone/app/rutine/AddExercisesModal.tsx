import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { api } from "@/src/utils/api";

type Exercise = {
  id: number;
  nombre: string;
  musculo_principal: string;
  url_media?: string;
};

type SelectedExercise = {
  id_ejercicio: number;
  series: number;
  repeticiones: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  routineId: number;
  existingExercises: Exercise[];
  onAdded: () => void;
};

const AddExercisesModal = ({
  visible,
  onClose,
  routineId,
  existingExercises,
  onAdded,
}: Props) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [filter, setFilter] = useState("");

  const theme = useColorScheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (visible) fetchExercises();
  }, [visible]);

  const fetchExercises = async () => {
    try {
      const res: Exercise[] = await api("/exercises");
      const existingIDs = existingExercises.map((e) => e.id);

      setExercises(res.filter((e) => !existingIDs.includes(e.id)));
    } catch (err) {
      console.log("Error cargando ejercicios", err);
    }
  };

  const toggleSelect = (ex: Exercise) => {
    const exists = selected.find((e) => e.id_ejercicio === ex.id);

    if (exists) {
      setSelected(selected.filter((e) => e.id_ejercicio !== ex.id));
    } else {
      setSelected([
        ...selected,
        { id_ejercicio: ex.id, series: 3, repeticiones: 12 },
      ]);
    }
  };

  const updateField = (
    id: number,
    field: "series" | "repeticiones",
    value: string
  ) => {
    setSelected((prev) =>
      prev.map((e) =>
        e.id_ejercicio === id ? { ...e, [field]: Number(value) } : e
      )
    );
  };

  const handleSubmit = async () => {
    try {
      await api(`/routine/${routineId}/exercises`, {
        method: "POST",
        body: { ejercicios: selected },
      });

      onAdded();
      onClose();
    } catch (err) {
      console.log("Error agregando ejercicios: ", err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? "#111827" : "white",
    },

    closeBtn: {
      backgroundColor: "#f97316",
      padding: 10,
      borderRadius: 10,
      width: 90,
    },

    closeText: {
      color: "white",
      textAlign: "center",
      fontWeight: "600",
    },

    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#f97316",
      marginVertical: 20,
      textAlign: "center",
    },

    input: {
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#ccc",
      backgroundColor: isDark ? "#1f2937" : "white",
      color: isDark ? "#e5e7eb" : "#111827",
      borderRadius: 10,
      padding: 10,
      marginBottom: 15,
    },

    card: {
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: isDark ? "#374151" : "#ddd",
      backgroundColor: isDark ? "#1f2937" : "#f9fafb",
    },

    selectedCard: {
      backgroundColor: isDark ? "#4b5563" : "#e4d0ff",
      borderColor: isDark ? "#f97316" : "purple",
    },

    image: { width: "100%", height: 120, borderRadius: 10 },

    name: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 5,
      color: isDark ? "#fff" : "#000",
    },

    sub: {
      color: isDark ? "#9ca3af" : "gray",
    },

    inputs: {
      marginTop: 8,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 4,
    },

    smallInput: {
      width: 60,
      borderWidth: 1,
      borderColor: isDark ? "#4b5563" : "#ccc",
      backgroundColor: isDark ? "#111827" : "white",
      color: isDark ? "#e5e7eb" : "#111827",
      borderRadius: 8,
      padding: 6,
      textAlign: "right",
    },

    confirmBtn: {
      backgroundColor: "green",
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
    },

    confirmText: {
      color: "white",
      textAlign: "center",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Agregar ejercicios</Text>

        <TextInput
          placeholder="Filtrar por músculo..."
          placeholderTextColor={isDark ? "#9ca3af" : "#888"}
          value={filter}
          onChangeText={setFilter}
          style={styles.input}
        />

        <ScrollView>
          {exercises
            .filter((ex) =>
              ex.musculo_principal
                ?.toLowerCase()
                .includes(filter.toLowerCase())
            )
            .map((ex) => {
              const isSelected = selected.some(
                (s) => s.id_ejercicio === ex.id
              );

              return (
                <TouchableOpacity
                  key={ex.id}
                  style={[styles.card, isSelected && styles.selectedCard]}
                  onPress={() => toggleSelect(ex)}
                >
                  {ex.url_media && (
                    <Image
                      source={{ uri: ex.url_media }}
                      style={styles.image}
                    />
                  )}

                  <Text style={styles.name}>{ex.nombre}</Text>
                  <Text style={styles.sub}>{ex.musculo_principal}</Text>

                  {isSelected && (
                    <View style={styles.inputs}>
                      <View style={styles.row}>
                        <Text style={{ color: isDark ? "#fff" : "#000" }}>
                          Series:
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          value={
                            selected.find((s) => s.id_ejercicio === ex.id)
                              ?.series.toString() || ""
                          }
                          onChangeText={(v) =>
                            updateField(ex.id, "series", v)
                          }
                          style={styles.smallInput}
                        />
                      </View>

                      <View style={styles.row}>
                        <Text style={{ color: isDark ? "#fff" : "#000" }}>
                          Reps:
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          value={
                            selected.find((s) => s.id_ejercicio === ex.id)
                              ?.repeticiones.toString() || ""
                          }
                          onChangeText={(v) =>
                            updateField(ex.id, "repeticiones", v)
                          }
                          style={styles.smallInput}
                        />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </ScrollView>

        {selected.length > 0 && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
            <Text style={styles.confirmText}>Agregar ejercicios</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

export default AddExercisesModal;
