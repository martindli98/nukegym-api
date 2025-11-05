import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";

export default function Register({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Registro</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <Button title="Crear cuenta" onPress={() => console.log(email, password)} />
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}
