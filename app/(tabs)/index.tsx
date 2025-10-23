// app/(tabs)/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
// Gesture Handler importları (Eğer silme işlemi eklemeyeceksen bunlara gerek yok)
// import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { AppTransaction, getTransactions /*, deleteTransaction */ } from '../../src/services/transactionService'; // deleteTransaction şimdilik yorumlu

// Para formatlama fonksiyonu (Önceki haliyle aynı, sorunsuz çalışıyor)
const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0,00 TL';
  }
  const options: Intl.NumberFormatOptions = {
    style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2,
  };
  try {
    const formattedAmount = Math.abs(amount).toLocaleString('tr-TR', options);
    if (amount === 0) return formattedAmount;
    return amount < 0 ? formattedAmount.replace('₺', '-₺') : formattedAmount.replace('₺', '+₺');
  } catch (e) {
    console.error("Error formatting currency:", e, "Amount:", amount);
    return (amount || 0).toFixed(2).replace('.', ',') + ' TL';
  }
};

export default function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<AppTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true); else setRefreshing(true);
    console.log("Fetching transactions...");
    const data = await getTransactions();
    setTransactions(data);
    if (!isRefresh) setLoading(false); else setRefreshing(false);
    console.log("Fetching complete.");
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Dashboard screen focused, fetching data...");
      fetchTransactions();
    }, [fetchTransactions])
  );

  // --- Hesaplamalar ---
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = totalIncome + totalExpense;

  // --- Liste Elemanı Render ---
  const renderTransactionItem = ({ item }: { item: AppTransaction }) => {
    const descriptionText = String(item.description || '');
    const payeeText = String(item.payee || '');
    const paymentMethodText = String(item.paymentMethod || '');
    const detailText = `${payeeText ? payeeText + ' - ' : ''}${paymentMethodText}`;
    const dateText = item.date instanceof Date ? item.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const amountText = formatCurrency(item.amount);

    return (
      // Silme işlemi eklenmeyecekse Swipeable ve GestureHandlerRootView'a gerek yok
      <View style={styles.transactionRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.transactionDescription} numberOfLines={1}>{descriptionText}</Text>
          <Text style={styles.transactionDetail} numberOfLines={1}>{detailText}</Text>
          <Text style={styles.transactionDate}>{dateText}</Text>
        </View>
        <Text style={[ styles.transactionAmount, { color: item.type === 'income' ? '#28a745' : '#dc3545' } ]}>
          {amountText}
        </Text>
      </View>
    );
  };

  // --- Ana Render ---
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* Özet Kartları */}
      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toplam Gelir</Text>
          {/* Kartlardaki Tutar için numberOfLines ve adjustsFontSizeToFit ekleyelim */}
          <Text
            style={[styles.cardAmount, { color: '#28a745' }]}
            numberOfLines={1} // Tek satırda kalmaya zorla
            adjustsFontSizeToFit={true} // Sığmazsa font boyutunu küçült
          >
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toplam Gider</Text>
          <Text
            style={[styles.cardAmount, { color: '#dc3545' }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {formatCurrency(totalExpense)}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bakiye</Text>
          <Text
            style={styles.cardAmount}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {formatCurrency(balance)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Son İşlemler</Text>

      {/* İşlem Listesi */}
      {loading && transactions.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchTransactions(true)} tintColor="#7c3aed" colors={["#7c3aed"]}/>
          }
          ListEmptyComponent={<Text style={styles.emptyListText}>Henüz işlem bulunmuyor.</Text>}
        />
      )}

      {/* FAB */}
      <Link href="/addTransactionModal" asChild>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <FontAwesome name="plus" size={22} color="white" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

// Stillendirme (Kart stilleri güncellendi)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', },
  logoutText: { fontSize: 16, color: '#7c3aed', fontWeight: '500', },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, // Kenar boşluğunu biraz azalttık
   marginTop: 15, },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 8, // İç yan boşluğu azalttık
    flex: 1, // Eşit dağılımı koru
    marginHorizontal: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
    alignItems: 'center',
    minHeight: 85, // Kartların minimum yüksekliği olsun
    justifyContent: 'center', // İçeriği dikeyde ortala
  },
  cardTitle: {
    fontSize: 12, // Başlığı biraz daha küçülttük
    color: '#6c757d',
    marginBottom: 6, // Tutar ile arasını açtık
    textAlign: 'center', // Başlığı ortala
  },
  cardAmount: {
    fontSize: 15, // Tutar fontunu hafif küçülttük
    fontWeight: 'bold',
    textAlign: 'center', // Tutarı ortala
    // color: '#111', // Varsayılan renk (gelir/gider için üzerine yazılıyor)
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 25, marginBottom: 10, paddingHorizontal: 20, color: '#111', },
  list: { paddingHorizontal: 15, },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff', paddingHorizontal: 15, marginVertical: 4, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, minHeight: 70, },
  transactionDescription: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 2, },
  transactionDetail: { fontSize: 13, color: '#777', },
  transactionDate: { fontSize: 11, color: '#aaa', marginTop: 4, },
  transactionAmount: { fontSize: 15, fontWeight: 'bold', marginLeft: 10, },
  fab: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#7c3aed', borderRadius: 28, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, shadowRadius: 4.65, },
  emptyListText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#6c757d', },
});