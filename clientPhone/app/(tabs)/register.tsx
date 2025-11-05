import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Button title="Crear cuenta" onPress={() => console.log(email, password)} />

      {/* volver a las tabs */}
      <Link href="/(tabs)">
        <Text style={{ textAlign: "center", marginTop: 20 }}>Volver</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12
  }
});
