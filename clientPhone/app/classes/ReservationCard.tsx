import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";

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

  const theme = useColorScheme();
  const isDark = theme === "dark";
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          borderColor: isDark ? "#374151" : "#e5e7eb",
        },
      ]}
    >
      {/* TITLE */}
      <Text
        style={[
          styles.title,
          { color: isDark ? "#f97316" : "#f97316" },
        ]}
      >
        {reservation.nombre}
      </Text>

      {/* INFO */}
      <Text style={[styles.text, { color: isDark ? "#d1d5db" : "#4b5563" }]}>
        🕒 {formatDate(reservation.horario)}
      </Text>

      <Text style={[styles.text, { color: isDark ? "#d1d5db" : "#4b5563" }]}>
        🏋️ {reservation.entrenador_nombre}
      </Text>

      <Text style={[styles.text, { color: isDark ? "#d1d5db" : "#4b5563" }]}>
        👥 Cupo: {reservation.cupo_maximo}
      </Text>

      {/* CANCEL BUTTON */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#dc2626" }]}
        onPress={() => onCancelReservation(reservation.id)}
      >
        <Text style={styles.buttonText}>Cancelar reserva</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    marginBottom: 6,
  },
  button: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default ReservationCard;
