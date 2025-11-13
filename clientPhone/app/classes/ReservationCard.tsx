import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  reservation: any;
  formatDate: (date: string) => string;
  onCancelReservation: (id: number) => void;
}

const ReservationCard: React.FC<Props> = ({
  reservation,
  formatDate,
  onCancelReservation,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{reservation.nombre}</Text>
      <Text style={styles.text}>🕒 {formatDate(reservation.horario)}</Text>
      <Text style={styles.text}>👤 {reservation.entrenador_nombre}</Text>
      <Text style={styles.text}>🧍‍♂️ Cupo: {reservation.cupo_maximo}</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444" }]}
        onPress={() => onCancelReservation(reservation.id)}
      >
        <Text style={styles.buttonText}>Cancelar reserva</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#222" },
  text: { color: "#444", marginBottom: 4 },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});

export default ReservationCard;
