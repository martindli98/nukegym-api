import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme} from "react-native";

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
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const reserva = userReservations?.find(
    (r) => r.id_clase === classItem.id_clase && r.estado === "reservado"
  );

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
        {classItem.nombre}
      </Text>

      {/* DESCRIPTION */}
      {classItem.descripcion ? (
        <Text
          style={[
            styles.desc,
            { color: isDark ? "#d1d5db" : "#4b5563" },
          ]}
        >
          {classItem.descripcion}
        </Text>
      ) : null}

      {/* INFO */}
      <Text style={[styles.text, { color: isDark ? "#d1d5db" : "#4b5563" }]}>
        🕒 {formatDate(classItem.horario)}
      </Text>
      <Text style={[styles.text, { color: isDark ? "#d1d5db" : "#4b5563" }]}>
        🏋️ {classItem.entrenador_nombre || "Sin entrenador"}
      </Text>
      <Text style={[styles.text, { color: isDark ? "#d1d5db" : "#4b5563" }]}>
        👥 Cupo: {classItem.cupo_maximo}{" "}
        {classItem.cupos_disponibles !== undefined &&
          `(${classItem.cupos_disponibles} disponibles)`}
      </Text>

      {/* CLIENT BUTTONS */}
      {isClient &&
        (reserva ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#dc2626" }]}
            onPress={() => onCancelReservation(reserva.id)}
          >
            <Text style={styles.buttonText}>Cancelar reserva</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              classItem.cupos_disponibles === 0 && { backgroundColor: "#9ca3af" },
            ]}
            onPress={() => onReserve(classItem.id_clase)}
            disabled={classItem.cupos_disponibles === 0}
          >
            <Text style={styles.buttonText}>
              {classItem.cupos_disponibles === 0 ? "Sin cupos" : "Reservar"}
            </Text>
          </TouchableOpacity>
        ))}

      {/* ADMIN BUTTONS */}
      {canManage && (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.subButton, { backgroundColor: "#3b82f6" }]}
            onPress={() => onEdit && onEdit(classItem)}
          >
            <Text style={styles.subButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subButton, { backgroundColor: "#ef4444" }]}
            onPress={() => onDelete && onDelete(classItem.id_clase)}
          >
            <Text style={styles.subButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    marginBottom: 6,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#f97316",
    borderRadius: 10,
    paddingVertical: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  subButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
  },
  subButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "600",
  },
});

export default ClassCard;
