import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { showError, showSuccess } from "@/src/utils/toast";

interface Props {
  onBack: () => void;
}

interface Comment {
  id: number;
  id_cliente: number;
  comentario: string;
  fecha: string;
}

export default function Feedback({ onBack }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
 
  const [rol, setRol] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const theme = useColorScheme();
  const isDark = theme === "dark";

  // ─────────────────────────────
  // Cargar usuario y comentarios
  // ─────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          setError("Debes iniciar sesión para enviar feedback.");
          return;
        }

        // Info del usuario
        const userRes = await api("/feedback/status");
        if (userRes.success) {
          const u = userRes.data;
          setFirstName(u.nombre || "");
          setLastName(u.apellido || "");
          setEmail(u.email || "");
          setRol(u.id_rol || null);
        } else {
          setError(userRes.message || "No se encontró el usuario.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ─────────────────────────────
  // Enviar feedback
  // ─────────────────────────────
 const handleSubmit = async () => {
  if (!message.trim()) {
    Alert.alert("Aviso", "Por favor escribe un comentario.");
    return;
  }

  try {
    setLoading(true);
    const res = await api("/feedback/postFeedback", {
      method: "POST",
      body: JSON.stringify({ comentario: message }),
    });

    if (res.success) {
      showSuccess("¡Gracias por tu feedback!");
      setSubmitted(true);
      setMessage("");
    } else {
      showError(res.message || "Error al enviar feedback");
    }
  } catch (err: any) {
    console.error(err);
    showError(err.message || "Error al enviar feedback");
  } finally {
    setLoading(false);
  }
};

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: isDark ? "#111827" : "#f3f4f6" },
    title: { fontSize: 22, fontWeight: "bold", color: isDark ? "#fff" : "#111827", marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, borderColor: isDark ? "#444" : "#ccc", borderRadius: 8, padding: 12, marginBottom: 12, color: isDark ? "#fff" : "#111827", backgroundColor: isDark ? "#1f2937" : "#fff" },
    button: { backgroundColor: "#f97316", padding: 12, borderRadius: 8, marginBottom: 12 },
    buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
    backButton: { backgroundColor: isDark ? "#374151" : "#d1d5db", padding: 12, borderRadius: 8 },
    backText: { color: isDark ? "#fff" : "#111827", textAlign: "center", fontWeight: "bold", fontSize: 16 },
    commentBox: { backgroundColor: isDark ? "#1f2937" : "#fff", padding: 12, borderRadius: 8, marginBottom: 8 },
    commentText: { color: isDark ? "#fff" : "#111827" },
    commentDate: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ marginTop: 10, color: "#f97316" }}>Cargando...</Text>
      </View>
    );
  }

  if (rol === null) {
    return (
      <View style={styles.container}>
        <Text style={{ color: isDark ? "#fff" : "#111827", textAlign: "center", marginBottom: 12 }}>
          Debes iniciar sesión para enviar feedback.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Feedback</Text>
          {submitted && <Text style={{ color: "green", textAlign: "center", marginBottom: 12 }}>¡Gracias por tu comentario!</Text>}
          {error ? <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text> : null}

          <TextInput style={styles.input} value={firstName} editable={false} placeholder="Nombre" />
          <TextInput style={styles.input} value={lastName} editable={false} placeholder="Apellido" />
          <TextInput style={styles.input} value={email} editable={false} placeholder="Email" />

          <TextInput
            style={[styles.input, { height: 140, textAlignVertical: "top" }]}
            placeholder="Escribe tu queja o sugerencia..."
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
    </ScrollView>
  );
}
