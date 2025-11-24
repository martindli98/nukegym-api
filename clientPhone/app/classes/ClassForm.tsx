import { showError } from "@/src/utils/toast";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  // Alert,
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

  const theme = useColorScheme();
  const isDark = theme === "dark";

  const handleSubmit = () => {
    if (!formData.nombre || !formData.cupo_maximo || !formData.fecha) {
      showError("Completa todos los campos requeridos.","Error")
      // Alert.alert("Error", "Completa todos los campos requeridos.");
      return;
    }
    onSubmit({
      ...formData,
      cupo_maximo: parseInt(formData.cupo_maximo),
    });
  };

  const styles = (isDark: boolean) =>
    StyleSheet.create({
      container: {
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        padding: 18,
        borderRadius: 16,
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 10,
        elevation: isDark ? 6 : 3,
      },

      label: {
        fontSize: 15,
        fontWeight: "600",
        color: isDark ? "#e2e8f0" : "#334155",
        marginTop: 14,
        marginBottom: 6,
      },

      input: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "#334155" : "#cbd5e1",
        borderRadius: 14,
        padding: 12,
        fontSize: 15,
        color: isDark ? "#f1f5f9" : "#0f172a",
        shadowColor: "#000",
        shadowOpacity: isDark ? 0.25 : 0.05,
        shadowRadius: 4,
        elevation: isDark ? 3 : 1,
      },

      textarea: {
        height: 90,
        textAlignVertical: "top",
      },

      buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
      },

      button: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 14,
        marginHorizontal: 6,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: isDark ? 0.35 : 0.15,
        shadowRadius: 5,
        elevation: isDark ? 5 : 3,
      },

      buttonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 15,
        textAlign: "center",
      },
    });

  // ⬅️ ACÁ ESTABA LO QUE FALTABA
  const s = styles(isDark);

  return (
    <View style={s.container}>
      <Text style={s.label}>Nombre de la clase</Text>
      <TextInput
        style={s.input}
        value={formData.nombre}
        onChangeText={(t) => setFormData({ ...formData, nombre: t })}
        placeholder="Ej: Yoga, CrossFit..."
        placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
      />

      <Text style={s.label}>Cupo máximo</Text>
      <TextInput
        style={s.input}
        keyboardType="numeric"
        value={formData.cupo_maximo}
        onChangeText={(t) => setFormData({ ...formData, cupo_maximo: t })}
        placeholder="Ej: 20"
        placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
      />

      <Text style={s.label}>Descripción</Text>
      <TextInput
        style={[s.input, s.textarea]}
        value={formData.descripcion}
        onChangeText={(t) => setFormData({ ...formData, descripcion: t })}
        multiline
        placeholder="Descripción breve..."
        placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
      />

      <Text style={s.label}>Fecha</Text>
      <TextInput
        style={s.input}
        value={formData.fecha}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
        onChangeText={(t) => setFormData({ ...formData, fecha: t })}
      />

      <Text style={s.label}>Hora de inicio</Text>
      <TextInput
        style={s.input}
        value={formData.horario_inicio}
        placeholder="HH:mm"
        placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
        onChangeText={(t) => setFormData({ ...formData, horario_inicio: t })}
      />

      <Text style={s.label}>Hora de fin</Text>
      <TextInput
        style={s.input}
        value={formData.horario_fin}
        placeholder="HH:mm"
        placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
        onChangeText={(t) => setFormData({ ...formData, horario_fin: t })}
      />

      <View style={s.buttonRow}>
        <TouchableOpacity
          style={[s.button, { backgroundColor: "#f97316" }]}
          onPress={onCancel}
        >
          <Text style={s.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.button, { backgroundColor: "#6D28D9" }]}
          onPress={handleSubmit}
        >
          <Text style={s.buttonText}>
            {initialData ? "Actualizar" : "Crear"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ClassForm;
