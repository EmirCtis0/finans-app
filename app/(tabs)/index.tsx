// app/(tabs)/index.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react"; // useMemo eklendi
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"; // TextInput eklendi
import { SafeAreaView } from 'react-native-safe-area-context';
// Silme işlemi için Gerekli importlar
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// Servis importları
import { AppTransaction, deleteTransaction, getTransactions } from '../../src/services/transactionService';

// Para formatlama fonksiyonu
const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) { return '0,00 TL'; }
  const options: Intl.NumberFormatOptions = { style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2, };
  try {
    const formattedAmount = Math.abs(amount).toLocaleString('tr-TR', options);
    if (amount === 0) return formattedAmount;
    return amount < 0 ? formattedAmount.replace('₺', '-₺') : formattedAmount.replace('₺', '+₺');
  } catch (e) {
    return (amount || 0).toFixed(2).replace('.', ',') + ' TL';
  }
};

type FilterType = 'all' | 'income' | 'expense';

export default function DashboardScreen() {
  const router = useRouter();
  // State'leri ayıralım: allTransactions API'den gelen ham veriyi tutacak
  const [allTransactions, setAllTransactions] = useState<AppTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Arama ve Filtreleme için yeni state'ler ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Veri çekme işlemi
  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true); else setRefreshing(true);
    const data = await getTransactions();
    setAllTransactions(data); // Ham veriyi sakla
    if (!isRefresh) setLoading(false); else setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchTransactions(); }, [fetchTransactions]));

  // --- Filtrelenmiş ve Aranmış Veriyi Hesaplama ---
  // Bu, her render'da gereksiz yere hesaplanmasın diye useMemo kullanıyoruz.
  const filteredTransactions = useMemo(() => {
    let transactions = [...allTransactions]; // Orijinal listeyi kopyala

    // 1. Tipe göre filtrele (Gelir/Gider)
    if (activeFilter !== 'all') {
      transactions = transactions.filter(t => t.type === activeFilter);
    }

    // 2. Arama metnine göre filtrele
    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      transactions = transactions.filter(t =>
        t.description?.toLowerCase().includes(lowercasedQuery) ||
        t.payee?.toLowerCase().includes(lowercasedQuery) ||
        t.paymentMethod?.toLowerCase().includes(lowercasedQuery)
      );
    }
    return transactions;
  }, [allTransactions, searchQuery, activeFilter]); // Bu değerler değiştiğinde yeniden hesapla


  // --- Silme İşlemi ---
  const handleDelete = (id: number) => {
    Alert.alert("İşlemi Sil", "Bu işlemi silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: async () => {
            setLoading(true);
            const success = await deleteTransaction(id);
            if (success) { await fetchTransactions(); }
            setLoading(false);
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  // --- Hesaplamalar (Filtrelenmiş listeye göre) ---
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = totalIncome + totalExpense;

  // --- Liste Elemanı Render ---
  const renderTransactionItem = ({ item }: { item: AppTransaction }) => { /* ... öncekiyle aynı ... */
    const renderRightActions = () => (
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        <FontAwesome name="trash-o" size={24} color="white" />
      </TouchableOpacity>
    );
    const descriptionText = String(item.description || '');
    const detailText = `${item.payee ? String(item.payee) + ' - ' : ''}${String(item.paymentMethod || '')}`;
    const dateText = item.date instanceof Date ? item.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const amountText = formatCurrency(item.amount);

    return (
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
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
      </Swipeable>
    );
  };

  // --- Ana Render ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity onPress={() => router.replace("/login")}><Text style={styles.logoutText}>Çıkış Yap</Text></TouchableOpacity>
        </View>

        {/* Özet Kartları (Artık filtrelenmiş veriyi gösteriyor) */}
        <View style={styles.summaryContainer}>
          <View style={styles.card}><Text style={styles.cardTitle}>Toplam Gelir</Text><Text style={[styles.cardAmount, { color: '#28a745' }]} numberOfLines={1} adjustsFontSizeToFit={true}>{formatCurrency(totalIncome)}</Text></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Toplam Gider</Text><Text style={[styles.cardAmount, { color: '#dc3545' }]} numberOfLines={1} adjustsFontSizeToFit={true}>{formatCurrency(totalExpense)}</Text></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Bakiye</Text><Text style={styles.cardAmount} numberOfLines={1} adjustsFontSizeToFit={true}>{formatCurrency(balance)}</Text></View>
        </View>

        {/* ----- YENİ: ARAMA VE FİLTRELEME BÖLÜMÜ ----- */}
        <View style={styles.filterContainer}>
          <View style={styles.searchWrapper}>
            <FontAwesome name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Açıklama, kişi, ödeme tipi ara..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.filterButtons}>
            <TouchableOpacity onPress={() => setActiveFilter('all')} style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}>
              <Text style={[styles.filterButtonText, activeFilter === 'all' && styles.filterButtonTextActive]}>Tümü</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveFilter('income')} style={[styles.filterButton, activeFilter === 'income' && styles.filterButtonActive]}>
              <Text style={[styles.filterButtonText, activeFilter === 'income' && styles.filterButtonTextActive]}>Gelir</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveFilter('expense')} style={[styles.filterButton, activeFilter === 'expense' && styles.filterButtonActive]}>
              <Text style={[styles.filterButtonText, activeFilter === 'expense' && styles.filterButtonTextActive]}>Gider</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Son İşlemler Başlığı */}
        <Text style={styles.sectionTitle}>İşlemler</Text>

        {/* İşlem Listesi (Filtrelenmiş veriyi kullanıyor) */}
        {loading && allTransactions.length === 0 ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size="large" color="#7c3aed" /></View>
        ) : (
          <FlatList
            data={filteredTransactions} // DİKKAT: Artık bu state'i kullanıyoruz
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTransactions(true)} tintColor="#7c3aed" colors={["#7c3aed"]}/>}
            ListEmptyComponent={<Text style={styles.emptyListText}>{allTransactions.length > 0 ? 'Filtreyle eşleşen sonuç bulunamadı.' : 'Henüz işlem bulunmuyor.'}</Text>}
          />
        )}

        {/* FAB */}
        <Link href="/addTransactionModal" asChild>
          <TouchableOpacity style={styles.fab} activeOpacity={0.8}><FontAwesome name="plus" size={22} color="white" /></TouchableOpacity>
        </Link>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Stillendirme (Yeni stiller eklendi)
const styles = StyleSheet.create({
  // ... (container, header, summaryContainer, card, cardTitle, cardAmount, sectionTitle stilleri aynı)
    container: { flex: 1, backgroundColor: '#f8f9fa', },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', },
    logoutText: { fontSize: 16, color: '#7c3aed', fontWeight: '500', },
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginTop: 15, },
    card: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 8, flex: 1, marginHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, alignItems: 'center', minHeight: 85, justifyContent: 'center', },
    cardTitle: { fontSize: 12, color: '#6c757d', marginBottom: 6, textAlign: 'center', },
    cardAmount: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 5, marginBottom: 10, paddingHorizontal: 20, color: '#111', },

  // --- YENİ FİLTRELEME STİLLERİ ---
  filterContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e5e7eb', // gray-200
  },
  filterButtonActive: {
    backgroundColor: '#7c3aed', // mor
  },
  filterButtonText: {
    color: '#374151', // gray-700
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  // ------------------------------------

  list: { paddingHorizontal: 15, },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff', paddingHorizontal: 15, marginVertical: 4, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, minHeight: 70, },
  transactionDescription: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 2, },
  transactionDetail: { fontSize: 13, color: '#777', },
  transactionDate: { fontSize: 11, color: '#aaa', marginTop: 4, },
  transactionAmount: { fontSize: 15, fontWeight: 'bold', marginLeft: 10, },
  fab: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#7c3aed', borderRadius: 28, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, shadowRadius: 4.65, },
  emptyListText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#6c757d', },
  deleteButton: { backgroundColor: '#dc3545', justifyContent: 'center', alignItems: 'center', width: 75, marginVertical: 4, borderTopRightRadius: 8, borderBottomRightRadius: 8, },
  deleteIcon: { color: 'white', },
});