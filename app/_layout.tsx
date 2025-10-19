// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" />
        
        {/* BU SATIRI EKLE */}
        <Stack.Screen 
          name="addTransactionModal" 
          options={{ 
            presentation: 'modal', 
            headerShown: true, // Modal'ın kendi başlığı görünsün
            title: 'Yeni İşlem' 
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}