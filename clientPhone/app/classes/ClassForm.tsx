import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

interface Props {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ClassForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    cupo_maximo: initialData?.cupo_maximo?.toString() || "",
    descripcion: initialData?.descripcion || "",
    fecha: initialData?.fecha || "",
    horario_inicio: initialData?.horario_inicio || "",
    horario_fin: initialData?.horario_fin || "",
  });

  const handleSubmit = () => {
    if (!formData.nombre || !formData.cupo_maximo || !formData.fecha) {
      Alert.alert("Error", "Completa todos los campos requeridos.");
      return;
    }
    onSubmit({
      ...formData,
      cupo_maximo: parseInt(formData.cupo_maximo),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre de la Clase</Text>
      <TextInput
        style={styles.input}
        value={formData.nombre}
        onChangeText={(t) => setFormData({ ...formData, nombre: t })}
        placeholder="Ej: Yoga, CrossFit..."
      />

      <Text style={styles.label}>Cupo Máximo</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.cupo_maximo}
        onChangeText={(t) => setFormData({ ...formData, cupo_maximo: t })}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={formData.descripcion}
        onChangeText={(t) => setFormData({ ...formData, descripcion: t })}
        multiline
      />

      <Text style={styles.label}>Fecha</Text>
      <TextInput
        style={styles.input}
        value={formData.fecha}
        placeholder="YYYY-MM-DD"
        onChangeText={(t) => setFormData({ ...formData, fecha: t })}
      />

      <Text style={styles.label}>Hora de inicio</Text>
      <TextInput
        style={styles.input}
        value={formData.horario_inicio}
        placeholder="HH:mm"
        onChangeText={(t) => setFormData({ ...formData, horario_inicio: t })}
      />

      <Text style={styles.label}>Hora de fin</Text>
      <TextInput
        style={styles.input}
        value={formData.horario_fin}
        placeholder="HH:mm"
        onChangeText={(t) => setFormData({ ...formData, horario_fin: t })}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#f97316" }]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {initialData ? "Actualizar" : "Crear"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#6b7280" }]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 20, borderRadius: 12 },
  label: { fontWeight: "bold", color: "#444", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});

export default ClassForm;
