import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  onRegisterPress: () => void;
  onLoginSuccess: () => void;
}

export default function ProfileLogin({
  onRegisterPress,
  onLoginSuccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://192.168.100.11:3000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (res.data.success && res.data.token) {
        await AsyncStorage.setItem("authToken", res.data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
        Alert.alert("Éxito", "Has iniciado sesión correctamente");
        onLoginSuccess();
      } else {
        Alert.alert("Error", res.data.message || "Error al iniciar sesión");
      }
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        "No se pudo iniciar sesión. Verifica tus datos o conexión."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRegisterPress}>
        <Text style={styles.registerText}>
          ¿No tenés cuenta? <Text style={styles.link}>Registrarse</Text>
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
