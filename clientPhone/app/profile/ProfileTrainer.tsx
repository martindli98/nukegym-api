import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { showError, showSuccess } from "@/src/utils/toast";
import ConfirmModal from "@/components/confirm_modal/ConfirmModal";

interface Trainer {
  id_entrenador: number;
  nombre: string;
  apellido: string;
  email: string;
  cupos: number;
  turno: string;
}

export default function ProfileTrainer({ onBack }: any) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [activeTrainerId, setActiveTrainerId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);

  const fetchUser = async () => {
    try {
      const stored = await AsyncStorage.getItem("userData");
      if (!stored) return;

      const u = JSON.parse(stored);
      const realUser = u.userData ? u.userData : u;

      setUser(realUser);
      setActiveTrainerId(realUser.id_trainer ?? null);
    } catch {
      showError("Error cargando usuario");
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api("/trainers");
      setTrainers(res.data ?? res);
    } catch (error) {
      console.log("ERROR FETCH TRAINERS:", error);
      showError("Error al cargar entrenadores");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!user || !selectedTrainer) return;

    try {
      const res = await api(`/trainers/${user.id}/asignar`, {
        method: "PUT",
        body: { id_trainer: selectedTrainer },
      });

      if (res && !res.error) {
        const updatedUser = { ...user, id_trainer: selectedTrainer };

        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

        setUser(updatedUser);
        setActiveTrainerId(selectedTrainer);

        showSuccess("Entrenador asignado correctamente");
      } else {
        showError("No se pudo asignar el entrenador");
      }
    } catch (error) {
      console.log("ASSIGN ERROR:", error);
      showError("Error al asignar entrenador");
    }

    setConfirmVisible(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchTrainers();
  }, [user]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Entrenadores disponibles</Text>

      {trainers.map((t) => (
        <View key={t.id_entrenador} style={styles.card}>
          <Text style={styles.text}>
            {t.nombre} {t.apellido}
          </Text>
          <Text style={styles.label}>Email: {t.email}</Text>
          <Text style={styles.label}>Cupos: {t.cupos}</Text>
          <Text style={styles.label}>Turno: {t.turno}</Text>

          {activeTrainerId === t.id_entrenador ? (
            <Text style={styles.assigned}>ASIGNADO ✔</Text>
          ) : (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                setSelectedTrainer(t.id_entrenador);
                setConfirmVisible(true);
              }}
            >
              <Text style={styles.btnText}>Asignar</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <ConfirmModal
        visible={confirmVisible}
        title="Confirmar asignación"
        message="¿Seguro que querés asignar este entrenador?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleAssign}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ff6600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  text: { fontSize: 18, fontWeight: "bold" },
  label: { fontSize: 14, marginTop: 4, color: "#555" },
  assigned: {
    marginTop: 10,
    color: "green",
    fontWeight: "bold",
    textAlign: "right",
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
