// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      {/* YENİ KAYIT EKRANI TANIMI */}
      <Stack.Screen name="register" options={{ title: "Kayıt Ol" }}/>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: "Detay" }}/>
      <Stack.Screen
        name="addTransactionModal"
        options={{ presentation: 'modal', headerShown: true, title: 'Yeni İşlem Ekle' }}
      />
    </Stack>
  );
}