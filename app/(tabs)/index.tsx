// app/(tabs)/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTransactions, Transaction } from '../../src/services/transactionService'; // Servisi import et

// Para formatlama fonksiyonu
const formatCurrency = (amount: number) => {
  return `${amount.toFixed(2).replace('.', ',')} TL`;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome + totalExpense;

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionRow}>
      <View>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'income' ? '#28a745' : '#dc3545' }
      ]}>
        {item.type === 'income' ? '+' : ''}{formatCurrency(item.amount)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Özet Kartları */}
      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Income</Text>
          <Text style={[styles.cardAmount, { color: '#28a745' }]}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Expense</Text>
          <Text style={[styles.cardAmount, { color: '#dc3545' }]}>{formatCurrency(Math.abs(totalExpense))}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance</Text>
          <Text style={styles.cardAmount}>{formatCurrency(balance)}</Text>
        </View>
      </View>

      {/* Son İşlemler */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        style={styles.list}
        refreshing={loading}
        onRefresh={fetchTransactions} // Listeyi aşağı çekince yenileme özelliği
      />

      {/* Yeni İşlem Ekle Butonu */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/addTransactionModal')}
      >
        <FontAwesome name="plus" size={22} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Açık gri arka plan
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  logoutText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 20,
    color: '#111',
  },
  list: {
    paddingHorizontal: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 30,
    backgroundColor: '#7c3aed',
    borderRadius: 28,
    elevation: 8,
  },
});