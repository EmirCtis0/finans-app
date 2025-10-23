// app/(tabs)/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome'; // Veya kullandığın ikon kütüphanesi
import { Tabs } from 'expo-router';
import React from 'react';

// İkonları render etmek için yardımcı component (isteğe bağlı)
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, // Renkleri tema'dan alabilirsin
         tabBarActiveTintColor: '#7c3aed', // Veya sabit renk
        headerShown: false, // Sekmelerin kendi başlığı olmasın (Dashboard kendi başlığını gösteriyor)
      }}>
      <Tabs.Screen
        name="index" // app/(tabs)/index.tsx dosyasına karşılık gelir
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports" // app/(tabs)/reports.tsx dosyasına karşılık gelir
        options={{
          title: 'Raporlar',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />, // Grafikler için ikon
        }}
      />
    </Tabs>
  );
}