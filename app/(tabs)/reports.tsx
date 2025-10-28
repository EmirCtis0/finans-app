// app/(tabs)/reports.tsx
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
// AppTransaction tipini ve getTransactions fonksiyonunu import ediyoruz
import { useFocusEffect } from 'expo-router';
import { AppTransaction, getTransactions } from '../../src/services/transactionService';
// import { FontAwesome } from '@expo/vector-icons'; // Gerekli değilse kaldırılabilir

const screenWidth = Dimensions.get("window").width;

// --- Sabit Renk Paleti (Pasta Grafiği için) ---
const PIE_CHART_COLORS = [
  '#60A5FA', // blue-400
  '#F87171', // red-400
  '#4ADE80', // green-400
  '#FACC15', // yellow-400
  '#FB923C', // orange-400
  '#A78BFA', // violet-400
  '#2DD4BF', // teal-400
  '#F472B6', // pink-400
];

// Para formatlama (Grafik etiketleri için kuruşsuz, legend için kuruşlu)
const formatCurrencyForDisplay = (amount: number | null | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) { return '₺0'; } // Kuruşsuz
  const options: Intl.NumberFormatOptions = { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 };
  try {
    const formatted = amount.toLocaleString('tr-TR', options);
    return formatted;
  } catch (e) {
    return `₺${(amount || 0).toFixed(0)}`;
  }
};
const formatCurrencyForLegend = (amount: number | null | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount)) { return '₺0,00'; }
    const options: Intl.NumberFormatOptions = { style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2 };
    try {
        const formattedAmount = Math.abs(amount).toLocaleString('tr-TR', options);
        return formattedAmount;
     } catch (e) {
        return `₺${(amount || 0).toFixed(2)}`;
     }
};


// Yüzde hesaplama
const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`.replace('.', ','); // Virgül kullan
};

export default function ReportsScreen() {
    // API'den gelen orijinal veriyi tutacak state
    const [transactions, setTransactions] = useState<AppTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Veri çekme fonksiyonu
    const fetchData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true); else setRefreshing(true);
        console.log("ReportsScreen: Fetching data...");
        const data = await getTransactions(); // API'den canlı veriyi çekiyoruz
        console.log("ReportsScreen: Data fetched:", data.length);
        setTransactions(data); // State'i güncelle
        if (!isRefresh) setLoading(false); else setRefreshing(false);
    }, []);

    // Ekran her açıldığında veriyi yenile
    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    // --- Veri Hazırlama (transactions state'i güncellendiğinde yeniden hesaplanır) ---

    // Pasta grafiği için (Giderlerin Ödeme Yöntemine Göre)
    // Veriyi API'den gelen `transactions` state'inden hesaplıyoruz
    const totalExpensesValue = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const expenseByPaymentMethod = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
            const method = transaction.paymentMethod || 'Diğer';
            acc[method] = (acc[method] || 0) + Math.abs(transaction.amount || 0);
            return acc;
        }, {} as Record<string, number>);

    // PieChart datası ve özel Legend datası için ayrı ayrı hazırlık
    const pieChartInternalData = Object.keys(expenseByPaymentMethod)
        .filter(method => expenseByPaymentMethod[method] > 0)
        .map((method, index) => ({
            name: method,
            amount: expenseByPaymentMethod[method],
            color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
        }));

    const legendData = pieChartInternalData.map(item => ({
        name: item.name,
        color: item.color,
        amount: item.amount,
        percentage: calculatePercentage(item.amount, totalExpensesValue),
    }));

    // Çubuk grafiği için (Toplam Gelir ve Gider)
    // Veriyi API'den gelen `transactions` state'inden hesaplıyoruz
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenseAbs = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0));

    const barChartData = {
        labels: ["Gelir", "Gider"],
        datasets: [{
            data: [
                Math.max(0, totalIncome),
                Math.max(0, totalExpenseAbs)
             ]
        }]
    };

    // BarChart yapılandırması (Daha modern)
    const barChartConfig = {
        backgroundColor: "#ffffff", // Kartın arka planı
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        // Barların rengi (Gelir ve Gider için farklı)
        // colors prop'u data içinde tanımlanacak, bu genel renk eksen/grid için
        color: (opacity = 1) => `rgba(209, 213, 219, ${opacity})`, // Grid çizgileri (gray-300)
        labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`, // Eksen etiketleri (gray-600)
        decimalPlaces: 0,
        barPercentage: 0.6,
        propsForLabels: { fontSize: 13, fontWeight: '500' },
        propsForBackgroundLines: { strokeWidth: 0.5, stroke: '#e5e7eb' }, // İnce grid çizgileri
        barRadius: 5, // Daha az yuvarlak köşe
        // Barların üzerine yazılacak değerlerin stili
        propsForLabelsOnTopOfBars: {
            fontSize: 11,
            fontWeight: '600',
            color: '#4b5563', // Koyu gri
        },
    };


    // --- Render ---

    if (loading && transactions.length === 0) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor="#7c3aed" colors={["#7c3aed"]}/>
                }
            >
                <Text style={styles.headerTitle}>Finans Raporları</Text>

                {/* --- Gider Dağılım Kartı --- */}
                <View style={styles.card}>
                    <Text style={styles.chartTitle}>Gider Dağılımı (Ödeme Yöntemi)</Text>
                    {pieChartInternalData.length > 0 ? (
                        <View style={styles.pieChartContainer}>
                            <PieChart
                                data={pieChartInternalData} // API'den gelen veriye göre hesaplandı
                                width={screenWidth * 0.8}
                                height={200}
                                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }} // Basit config
                                accessor={"amount"}
                                backgroundColor={"transparent"}
                                paddingLeft={"10"}
                                center={[5, 0]}
                                absolute
                                hasLegend={false} // Kendi legend'ımızı kullanıyoruz
                            />
                            {/* Özel Legend */}
                            <View style={styles.legendContainer}>
                                {legendData.map((item) => (
                                    <View key={item.name} style={styles.legendItem}>
                                        <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                                        <Text style={styles.legendTextName}>{item.name}: </Text>
                                        <Text style={styles.legendTextAmount}>{formatCurrencyForLegend(item.amount)}</Text>
                                        <Text style={styles.legendTextPercentage}> ({item.percentage})</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>Gider verisi bulunamadı.</Text>
                    )}
                </View>

                {/* --- Gelir/Gider Karşılaştırma Kartı --- */}
                <View style={styles.card}>
                    <Text style={styles.chartTitle}>Toplam Gelir ve Gider</Text>
                    {(totalIncome > 0 || totalExpenseAbs > 0) ? (
                         <BarChart
                            data={{ // Data prop'unu withCustomBarColorFromData için özelleştir
                                labels: barChartData.labels,
                                datasets: [
                                    {
                                        data: barChartData.datasets[0].data,
                                        // Her bar için ayrı renk (Gelir yeşil, Gider kırmızı)
                                        colors: [
                                            (opacity = 1) => `#4ade80`, // Green 400
                                            (opacity = 1) => `#f87171`, // Red 400
                                        ]
                                    }
                                ]
                            }}
                            width={screenWidth * 0.85} // Kart genişliğine göre
                            height={240}
                            yAxisLabel="₺ "
                            yAxisSuffix=""
                            chartConfig={barChartConfig} // Yeni config
                            style={styles.chartStyle}
                            verticalLabelRotation={0}
                            showValuesOnTopOfBars={true} // Değerleri göster
                            withCustomBarColorFromData={true} // Yukarıdaki colors dizisini kullan
                            flatColor={false} // Gradyan için false (config'de ayarlandı)
                            withInnerLines={true} // İç çizgileri config belirlesin
                            showBarTops={false} // Bar üstü çizgileri gizle
                            fromZero={true}
                        />
                    ) : (
                       <Text style={styles.noDataText}>Gelir veya gider verisi bulunamadı.</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// --- Güncellenmiş Stiller ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6', },
    center: { justifyContent: 'center', alignItems: 'center', },
    scrollContainer: { paddingVertical: 20, paddingHorizontal: 15, alignItems: 'center', },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingVertical: 20, paddingHorizontal: 10, marginBottom: 25, width: screenWidth - 30,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
        alignItems: 'center',
    },
    chartTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 20, textAlign: 'center' },
    pieChartContainer: { alignItems: 'center', },
    legendContainer: { marginTop: 20, width: '100%', paddingHorizontal: '10%', }, // Legend için yan boşluk
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, },
    legendColorBox: { width: 14, height: 14, borderRadius: 7, marginRight: 10, },
    legendTextName: { fontSize: 14, color: '#4b5563', fontWeight: '500', flexShrink: 1, marginRight: 5 },
    legendTextAmount: { fontSize: 14, color: '#1f2937', fontWeight: '600', },
    legendTextPercentage: { fontSize: 13, color: '#6b7280', marginLeft: 'auto', paddingLeft: 10, },
    chartStyle: { // Bar chart için stil
        borderRadius: 16,
        paddingTop: 10, // Üstteki değerler için boşluk
        paddingBottom: 5, // Alt etiketler için boşluk
    },
    noDataText: { textAlign: 'center', color: '#6B7280', fontSize: 15, paddingVertical: 40, }
});