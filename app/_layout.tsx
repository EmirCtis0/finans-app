// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Giriş yapılmadığında gösterilecek ekranlar */}
      <Stack.Screen name="index" /> {/* Genellikle login'e yönlendirir */}
      <Stack.Screen name="login" />

      {/* Giriş yapıldıktan sonra gösterilecek Tabs layout */}
      <Stack.Screen name="(tabs)" />

      {/* Modal olarak açılacak ekranlar */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: "Detay" }}/>
      <Stack.Screen
        name="addTransactionModal"
        options={{ presentation: 'modal', headerShown: true, title: 'Yeni İşlem Ekle' }}
      />
    </Stack>
  );
}