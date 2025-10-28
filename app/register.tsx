// app/register.tsx
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform // Platform eklendi
    ,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerUser } from '../src/services/authService'; // Oluşturduğumuz servisi import et

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basit validasyonlar
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Daha iyi email format kontrolü
        Alert.alert("Geçersiz E-posta", "Lütfen geçerli bir e-posta adresi girin.");
        return;
    }
    if (password.length < 6) {
        Alert.alert("Kısa Şifre", "Şifreniz en az 6 karakter olmalıdır.");
        return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      // authService'deki registerUser fonksiyonunu çağır
      const success = await registerUser(name.trim(), email.trim(), password);
      if (success) {
        Alert.alert(
          "Kayıt Başarılı",
          "Hesabınız oluşturuldu. Giriş ekranına yönlendiriliyorsunuz.",
          [{ text: "Tamam", onPress: () => router.replace('/login') }]
        );
      }
      // Hata durumunda mesaj zaten service içinde gösteriliyor.
    } catch (error) {
       console.error("Register screen catch block error:", error);
       Alert.alert("Hata", "Kayıt sırasında beklenmedik bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Boş alana tıklayınca klavyeyi kapatmak için
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          <Text style={styles.title}>Hesap Oluştur</Text>

          <TextInput
            style={styles.input}
            placeholder="Adınız Soyadınız"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor="#9ca3af"
            returnKeyType="next" // Sonraki input'a geçiş için (opsiyonel)
          />

          <TextInput
            style={styles.input}
            placeholder="E-posta Adresi"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre (en az 6 karakter)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9ca3af"
            returnKeyType="done" // Kayıt butonuyla aynı işlevi görsün (opsiyonel)
            onSubmitEditing={handleRegister} // Enter'a basınca kayıt yapmayı dene (opsiyonel)
          />

          {/* Kayıt Ol Butonu */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]} // Loading durumunda stil değişimi
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading} // Yüklenirken butonu devre dışı bırak
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small"/>
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          {/* Giriş Yap Linki */}
          <Link href="/login" asChild>
               <TouchableOpacity style={styles.linkButton}>
                  <Text style={styles.linkText}>
                      Zaten hesabınız var mı? Giriş Yapın
                  </Text>
               </TouchableOpacity>
          </Link>

        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    fontSize: 32, // Biraz daha büyük
    fontWeight: 'bold',
    color: '#4f46e5', // Indigo rengi (Tailwind indigo-600)
    marginBottom: 30, // Daha fazla boşluk
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db', // Gri kenarlık (Tailwind gray-300)
    borderRadius: 12, // Daha yuvarlak köşeler
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12, // Platforma göre padding
    marginBottom: 16, // Inputlar arası boşluk
    fontSize: 16,
    color: '#1f2937', // Koyu gri yazı
  },
  button: {
    width: '100%',
    backgroundColor: '#4f46e5', // Indigo rengi
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10, // Son input'tan sonra boşluk
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc', // Açık indigo (disabled görünüm)
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600', // Semi-bold
  },
  linkButton: {
    marginTop: 24, // Butondan sonra boşluk
  },
  linkText: {
    color: '#4f46e5', // Indigo rengi
    fontSize: 15,
    fontWeight: '500',
  },
});