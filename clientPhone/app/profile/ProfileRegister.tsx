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

interface Props {
  onBack: () => void;
}

export default function ProfileRegister({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    console.log("handleeeeeeeeeereigsteeeeeeeeeeeeeeeer");
    if (!email || !dni || !password) {
      showError("Error", "Todos los campos son obligatorios");
      // Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      console.log("tryyyyyyyyyyyyyyyyyyyyyy");
      const res = await api("/auth/register-user", {
        method: "POST",
        body: JSON.stringify({
          email,
          nro_documento: dni,
          password,
        }),
      });

      console.log(res);
      if (res.success) {
        // Alert.alert(
        //   "Éxito",
        //   "Usuario registrado correctamente. Ahora podés iniciar sesión."
        // );
        showSuccess("Usuario registrado correctamente.", "Éxito");
        onBack();
        console.log("anduvoo");
      } else {
        // Alert.alert("Error", res.data.message || "No se pudo registrar");
        showError(res.data.message || "No se pudo registrar","Error");
      }
    } catch {
      // Alert.alert("Error", "No se pudo conectar con el servidor");
      showError("No se pudo conectar con el servidor","Error");
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
    padding: 12,
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
});
