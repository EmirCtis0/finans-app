import { useRouter } from "expo-router";
import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const dummyTransactions = [
  { id: "1", type: "Income", amount: 5000, category: "Salary" },
  { id: "2", type: "Expense", amount: 200, category: "Groceries" },
  { id: "3", type: "Expense", amount: 100, category: "Transport" },
];

export default function TransactionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <FlatList
        data={dummyTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.category}</Text>
            <Text style={[styles.itemText, { color: item.type === "Income" ? "green" : "red" }]}>
              {item.type === "Income" ? "+" : "-"}₺{item.amount}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button title="LOGOUT" color="#fff" onPress={() => router.replace("/login")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#ffffff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemText: { fontSize: 16, color: "#111" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ef4444", // red
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
});
