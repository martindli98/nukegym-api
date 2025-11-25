import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image
  // Alert,
} from "react-native";
import { api } from "@/src/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showSuccess, showError } from "@/src/utils/toast";

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
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const handleLogin = async () => {
    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (res.success && res.token) {
        await AsyncStorage.setItem("authToken", res.token);
        await AsyncStorage.setItem("userData", JSON.stringify(res.user));
        showSuccess("Has iniciado sesión correctamente", "Éxito");
        onLoginSuccess();
      } else {
        showError("Error", res.data.message || "Error al iniciar sesión");
        // Alert.alert("Error", res.data.message || "Error al iniciar sesión");
      }
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      showError(
        "No se pudo iniciar sesión. Verifica tus datos o conexión.",
        "Error"
      );
    }
  };

  const styles = StyleSheet.create({
              container: {
                flex: 1,
                justifyContent: "center",    
                alignItems: "center",       
                padding: 24,
                backgroundColor: isDark ? "#111827" : "#f3f4f6", 
              },

              formContainer: {             
                width: "100%",
                maxWidth: 400,              
                alignItems: "center",        
              },

              logo: {
                width: 120,   
                height: 120,  
                marginBottom: 24,
              },

              title: {
                fontSize: 24,
                fontWeight: "bold",
                color: isDark ? "#ffffff" : "#f97316",
                textAlign: "center",
                marginBottom: 32,
              },

              input: {
                width: "100%",               // ocupa todo el ancho del formContainer
                backgroundColor: isDark ? "#4f5865f5" : "#ffffff",
                borderWidth: 1,
                borderColor: isDark ? "#66728dff" : "#d1d5db",
                borderRadius: 8,
                padding: 12,
                color: isDark ? "#ffffffff" : "#111827",
                marginBottom: 16,
              },

              button: {
                width: "100%",               // ocupa todo el ancho del formContainer
                backgroundColor: isDark ? "#f87909" : "#f97316",
                paddingVertical: 12,
                borderRadius: 8,
              },

              buttonText: {
                color: "#fff",
                fontSize: 18,
                textAlign: "center",
                fontWeight: "600",
              },

              registerText: {
                textAlign: "center",
                marginTop: 16,
                color: isDark ? "#d1d5db" : "#374151",
              },

              link: {
                color: isDark ? "#f87909" : "#f97316",
                fontWeight: "bold",
              },
            });

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/LOGO GYM-TRANSPARENTE.png")} 
        style={styles.logo}
        resizeMode="contain"
      />
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

