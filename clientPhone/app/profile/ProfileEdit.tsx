import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardTypeOptions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { Picker } from "@react-native-picker/picker";
import { showError, showSuccess } from "@/src/utils/toast";

interface Props {
  onCancel: () => void;
  onSave: () => void;
}

interface UserData {
  nombre: string;
  apellido: string;
  email: string;
  nro_documento: string;
  turno?: string;
  num_personal?: string;
  num_emergencia?: string;
  fechaNac?: string;
  patologias?: string;
}

export default function ProfileEdit({ onCancel, onSave }: Props) {
  const [formData, setFormData] = useState<UserData>({
    nombre: "",
    apellido: "",
    email: "",
    nro_documento: "",
    num_personal: "",
    num_emergencia: "",
    turno: "",
    fechaNac: "",
    patologias: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const storedUser = await AsyncStorage.getItem("userData");

      if (!token) {
        showError("Por favor iniciá sesión nuevamente.", "Sesión inválida")
        return;
      }

      let user = storedUser ? JSON.parse(storedUser) : null;

      const res = await api("/users/profile");

      if (res?.success && (res.user || res.data)) {
        user = res.user || res.data;
        await AsyncStorage.setItem("userData", JSON.stringify(user));
      }

      if (user) {
        setFormData({
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          email: user.email || "",
          nro_documento: user.nro_documento || "",
          num_personal: user.num_personal || "",
          num_emergencia: user.num_emergencia || "",
          turno: user.turno,
          fechaNac: user.fechaNac ? user.fechaNac.split("T")[0] : "",
          patologias: user.patologias || "",
        });
      }
    } catch (error: any) {
      console.log("Error loading profile:", error.message);
      showError("No se pudo cargar el perfil.", "Error")
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof UserData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    // Validar nombre
    if (!formData.nombre.trim()) return "El nombre es obligatorio";
    if (!/^[a-zA-ZÀ-ÿ\s]{2,30}$/.test(formData.nombre))
      return "El nombre solo puede contener letras y debe tener entre 2 y 30 caracteres";

    // Validar apellido
    if (!formData.apellido.trim()) return "El apellido es obligatorio";
    if (!/^[a-zA-ZÀ-ÿ\s]{2,30}$/.test(formData.apellido))
      return "El apellido solo puede contener letras y debe tener entre 2 y 30 caracteres";

    // Validar email
    if (!formData.email.trim()) return "El email es obligatorio";
    if (!/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email))
      return "Formato de email inválido";

    // Validar DNI (solo números, 7 u 8 dígitos)
    if (!/^\d{7,8}$/.test(formData.nro_documento))
      return "El DNI debe tener entre 7 y 8 dígitos numéricos";

    // Validar teléfono personal (opcional)
    if (formData.num_personal && !/^\d{8,15}$/.test(formData.num_personal))
      return "El teléfono personal debe tener entre 8 y 15 dígitos numéricos";

    // Validar teléfono de emergencia (opcional)
    if (formData.num_emergencia && !/^\d{8,15}$/.test(formData.num_emergencia))
      return "El teléfono de emergencia debe tener entre 8 y 15 dígitos numéricos";

    // Validar que los teléfonos no sean iguales
    if (
      formData.num_personal &&
      formData.num_emergencia &&
      formData.num_personal === formData.num_emergencia
    )
      return "El teléfono personal y el de emergencia no pueden ser iguales";

    // Validar fecha de nacimiento (opcional)
    if (formData.fechaNac) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaNac))
        return "La fecha de nacimiento debe tener el formato YYYY-MM-DD";

      const fecha = new Date(formData.fechaNac);
      const hoy = new Date();
      if (fecha > hoy) return "La fecha de nacimiento no puede ser futura";

      const edad = hoy.getFullYear() - fecha.getFullYear();
      if (edad < 10) return "El usuario debe tener al menos 10 años";
    }

    // Validar patologías (opcional)
    if (formData.patologias && formData.patologias.length > 200)
      return "Las patologías no pueden superar los 200 caracteres";

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      showError(error, "Error de validación")
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        showError("No se encontró token de autenticación.", "Error")
        return;
      }

      const res = await api("/users/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        showSuccess("Perfil actualizado correctamente", "Éxito")

        const updatedUser = res.user || formData;
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

        onSave();
      } else {
        showError("No se pudo actualizar el perfil", res.message)
      }
    } catch (err: any) {
      console.log("Error saving profile:", err.message);
      showError("Error al guardar los cambios", "Error")
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  const fields: {
    label: string;
    key: keyof UserData;
    keyboard?: KeyboardTypeOptions;
  }[] = [
    { label: "Nombre *", key: "nombre" },
    { label: "Apellido *", key: "apellido" },
    { label: "Email *", key: "email", keyboard: "email-address" },
    { label: "DNI *", key: "nro_documento", keyboard: "numeric" },
    { label: "Teléfono Personal", key: "num_personal", keyboard: "numeric" },
    {
      label: "Teléfono de Emergencia",
      key: "num_emergencia",
      keyboard: "numeric",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      {/* Campos normales */}
      {fields.map((f) => (
        <View key={f.key} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>

          <TextInput
            style={styles.input}
            value={(formData as any)[f.key] ?? ""}
            keyboardType={f.keyboard ?? "default"}
            onChangeText={(text) => handleChange(f.key, text)}
          />
        </View>
      ))}

      {/* Turno */}
      <View style={styles.field}>
        <Text style={styles.label}>Turno</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.turno}
            onValueChange={(value) => handleChange("turno", value)}
          >
            <Picker.Item label="Mañana" value="mañana" />
            <Picker.Item label="Tarde" value="tarde" />
            <Picker.Item label="Noche" value="noche" />
          </Picker>
        </View>
      </View>

      {/* Fecha de nacimiento */}
      <View style={styles.field}>
        <Text style={styles.label}>Fecha de Nacimiento</Text>
        <TextInput
          style={styles.input}
          value={formData.fechaNac}
          placeholder="YYYY-MM-DD"
          onChangeText={(text) => handleChange("fechaNac", text)}
        />
      </View>

      {/* Patologías */}
      <View style={styles.field}>
        <Text style={styles.label}>Patologías</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          multiline
          value={formData.patologias}
          onChangeText={(text) => handleChange("patologias", text)}
        />
      </View>

      {/* Botones */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    borderBottomWidth: 2,
    borderBottomColor: "#f97316",
    marginBottom: 20,
    paddingBottom: 5,
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#444",
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#f97316",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
});
