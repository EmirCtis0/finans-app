import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dummyUser = { email: "test@fugevet.com", password: "123456" };

  const handleLogin = () => {
    if (email === dummyUser.email && password === dummyUser.password) {
      router.replace("/(tabs)");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.safe}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back 👋</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>test@fugevet.com / 123456</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#6b21a8", justifyContent: "center" }, // purple bg
  container: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    marginVertical: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 16, color: "#111" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: "#111",
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#7c3aed", // purple
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  hint: { marginTop: 10, textAlign: "center", color: "#6b7280" },
});
