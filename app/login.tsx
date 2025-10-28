// app/login.tsx
import { Link, useRouter } from "expo-router"; // Link import edildi
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"; // TouchableOpacity, Platform eklendi
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("test@fugevet.com");
  const [password, setPassword] = useState("123456");

  const dummyUser = { email: "test@fugevet.com", password: "123456" };

  const handleLogin = () => {
    // TODO: Gerçek login API isteği
    if (email === dummyUser.email && password === dummyUser.password) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Giriş Başarısız", "E-posta veya şifre yanlış!");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>FugeVet Finans</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta Adresi"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9ca3af"
        />

        {/* Giriş Butonu (TouchableOpacity ile daha şık) */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>

        {/* Kayıt Ol Linki */}
        <Link href="/register" asChild>
             <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>
                    Hesabınız yok mu? Kayıt Olun
                </Text>
             </TouchableOpacity>
        </Link>

        <Text style={styles.dummyInfo}>
          Test: {dummyUser.email} / {dummyUser.password}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet kullanarak stillendirme
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f3f4f6', // Açık gri arka plan
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24, // Yan boşluklar
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4f46e5', // Indigo rengi
        marginBottom: 30,
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db', // Gri kenarlık
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
        marginBottom: 16,
        fontSize: 16,
        color: '#1f2937',
    },
    button: {
        width: '100%',
        backgroundColor: '#4f46e5', // Indigo rengi
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 24,
    },
    linkText: {
        color: '#4f46e5', // Indigo rengi
        fontSize: 15,
        fontWeight: '500',
    },
    dummyInfo: {
        marginTop: 15,
        color: '#6b7280', // Gri
        fontSize: 12,
        textAlign: 'center',
    }
});