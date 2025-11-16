import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  classItem: any;
  isClient: boolean;
  canManage: boolean;
  userReservations: any[];
  onReserve: (id: number) => void;
  onCancelReservation: (id: number) => void;
  onEdit?: (classItem: any) => void;
  onDelete?: (id: number) => void;
  formatDate: (date: string) => string;
}

const ClassCard: React.FC<Props> = ({
  classItem,
  isClient,
  canManage,
  userReservations,
  onReserve,
  onCancelReservation,
  onEdit,
  onDelete,
  formatDate,
}) => {
  const reserva = userReservations?.find(
    (r) => r.id_clase === classItem.id_clase && r.estado === "reservado"
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{classItem.nombre}</Text>
      {classItem.descripcion ? (
        <Text style={styles.desc}>{classItem.descripcion}</Text>
      ) : null}
      <Text style={styles.text}>🕒 {formatDate(classItem.horario)}</Text>
      <Text style={styles.text}>
        👤 {classItem.entrenador_nombre || "Sin entrenador"}
      </Text>
      <Text style={styles.text}>
        🧍‍♂️ Cupo: {classItem.cupo_maximo}{" "}
        {classItem.cupos_disponibles !== undefined &&
          `(${classItem.cupos_disponibles} disponibles)`}
      </Text>

      {isClient &&
        (reserva ? (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => onCancelReservation(reserva.id)}
          >
            <Text style={styles.buttonText}>Cancelar reserva</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              classItem.cupos_disponibles === 0 && styles.disabledButton,
            ]}
            onPress={() => onReserve(classItem.id_clase)}
            disabled={classItem.cupos_disponibles === 0}
          >
            <Text style={styles.buttonText}>
              {classItem.cupos_disponibles === 0 ? "Sin cupos" : "Reservar"}
            </Text>
          </TouchableOpacity>
        ))}

      {canManage && (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#3b82f6" }]}
            onPress={() => onEdit && onEdit(classItem)}
          >
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ef4444" }]}
            onPress={() => onDelete && onDelete(classItem.id_clase)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e8e8e8",
    borderRadius: 5,
    padding: 3,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 12,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#6D28D9", paddingBottom: 4 },
  desc: { color: "gray", marginVertical: 5 },
  text: { color: "gray", marginVertical: 4 },
  button: {
    backgroundColor: "#f97316",
    borderRadius: 5,
    paddingVertical: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    paddingHorizontal: 14,
  },
  cancelButton: { backgroundColor: "#ef4444" },
  disabledButton: { backgroundColor: "#ccc" },
});

export default ClassCard;
