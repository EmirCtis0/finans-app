import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Transactions", headerShown: true }} />
      <Tabs.Screen name="reports" options={{ title: "Reports", headerShown: true }} />
    </Tabs>
  );
}
