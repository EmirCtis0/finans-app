import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Dummy kullanıcı verisi
  const dummyUser = {
    email: "test@fugevet.com",
    password: "123456",
  };

  const handleLogin = () => {
    if (email === dummyUser.email && password === dummyUser.password) {
      router.replace("/(tabs)"); // Dashboard'a yönlendir
    } else {
      Alert.alert("Login Failed", "Email or password is incorrect!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FugeVet Finance App</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});
