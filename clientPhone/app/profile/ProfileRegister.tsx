import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  // Alert,
} from "react-native";
import { api } from "@/src/utils/api";
import { showSuccess, showError } from "@/src/utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

interface Props {
  onBack: () => void;
  onLoginSuccess?: () => void;
}

export default function ProfileRegister({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [turno, setTurno] = useState("");

  const handleRegister = async () => {
    if (!email || !dni || !password || !turno) {
      showError("Todos los campos son obligatorios", "Error");
      return;
    }

    try {
      const res = await api("/auth/register-user", {
        method: "POST",
        body: JSON.stringify({
          email,
          nro_documento: dni,
          password,
          turno,
        }),
      });

      // console.log(res);
      if (res.success) {
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            token: res.token,
            userData: res.user,
          })
        );
        showSuccess("Usuario registrado correctamente.", "Éxito");
        onBack();

        // if (onLoginSuccess) onLoginSuccess();
      } else {
        showError(res.data.message || "No se pudo registrar", "Error");
      }
    } catch {
      showError("No se pudo conectar con el servidor", "Error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="DNI"
        value={dni}
        onChangeText={setDni}
        style={styles.input}
        keyboardType="numeric"
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={turno}
          onValueChange={setTurno}
          style={styles.picker}
        >
          <Picker.Item style={styles.selectPicker} label="Seleccione un turno..." value="" />
          <Picker.Item label="Mañana" value="mañana" />
          <Picker.Item label="Tarde" value="tarde" />
          <Picker.Item label="Noche" value="noche" />
        </Picker>
      </View>
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.registerText}>
          ¿Tenés cuenta? <Text style={styles.link}>Iniciar sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f97316",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 14,
    paddingLeft: 8,
    height: 50,
    marginBottom: 16,
  },
  button: { backgroundColor: "#f97316", paddingVertical: 12, borderRadius: 8 },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  registerText: { textAlign: "center", marginTop: 16, color: "#374151" },
  link: { color: "#f97316", fontWeight: "bold" },
  turnoBtn: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: "#EEE",
    borderRadius: 8,
  },
  turnoBtnActive: {
    backgroundColor: "#ff9800",
  },
  turnoText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "600",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 16,
  },

  picker: {
    height: 50,
    width: "100%",
    color: "gray"
  },
  selectPicker: {
    color: "gray",
    
  }
});
