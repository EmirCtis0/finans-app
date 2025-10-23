// app/(tabs)/reports.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTransaction, getTransactions } from '../../src/services/transactionService'; // AppTransaction kullanıyoruz

const screenWidth = Dimensions.get("window").width;

// --- Sabit Renk Paleti ---
// Daha fazla kategori olursa bu listeyi genişletebilirsin
const COLOR_PALETTE = [
  '#60A5FA', // blue-400
  '#F87171', // red-400
  '#4ADE80', // green-400
  '#FACC15', // yellow-400
  '#FB923C', // orange-400
  '#A78BFA', // violet-400
  '#2DD4BF', // teal-400
  '#F472B6', // pink-400
];

export default function ReportsScreen() {
    const [transactions, setTransactions] = useState<AppTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const data = await getTransactions();
        setTransactions(data);
        setLoading(false);
    }, []);

    useFocusEffect(
      useCallback(() => {
        console.log("Reports screen focused, fetching data...");
        fetchData();
      }, [fetchData])
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    // Pasta grafiği için veriyi hazırla (Giderlerin Ödeme Yöntemine Göre Dağılımı)
    const expenseByPaymentMethod = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
            const method = transaction.paymentMethod || 'Diğer';
            if (!acc[method]) {
                acc[method] = 0;
            }
            acc[method] += Math.abs(transaction.amount);
            return acc;
        }, {} as Record<string, number>);

    // Sabit renk paletini kullanarak pieChartData oluştur
    const pieChartData = Object.keys(expenseByPaymentMethod)
        .filter(method => expenseByPaymentMethod[method] > 0)
        .map((method, index) => ({
            name: method, // Kategori adı (Legend için)
            amount: expenseByPaymentMethod[method], // Değer
            // Renk paletinden sırayla al, palet biterse başa dön (% operatörü ile)
            color: COLOR_PALETTE[index % COLOR_PALETTE.length],
            legendFontColor: '#4B5563', // Koyu gri (Tailwind gray-600)
            legendFontSize: 13,        // Font boyutunu küçülttük
        }));

    // Çubuk grafiği için veriyi hazırla (Toplam Gelir ve Gider)
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const barChartData = {
        labels: ["Gelir", "Gider"],
        datasets: [
            {
                data: [totalIncome, totalExpense]
            }
        ]
    };

    // Grafiklerin genel yapılandırması (Font boyutları ayarlandı)
    const chartConfig = {
        backgroundGradientFrom: "#ffffff", // Beyaz arka plan
        backgroundGradientFromOpacity: 1,  // Opak
        backgroundGradientTo: "#ffffff",   // Beyaz arka plan
        backgroundGradientToOpacity: 1,    // Opak
        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`, // Ana renk (mor)
        labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // Eksen etiket renkleri (Tailwind gray-700)
        strokeWidth: 2,
        barPercentage: 0.6, // Çubukları biraz daha incelttik
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        propsForLabels: { // Eksen etiketlerinin stili
          fontSize: 11,   // Font boyutunu küçülttük
          // fontWeight: '500', // Opsiyonel: font ağırlığı
        },
        // Pasta grafiği için özel ayarlar (iç etiketler vb.) chartConfig içinde tanımlanmaz.
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.headerTitle}>Finans Raporları</Text>

                {/* Gider Dağılımı Grafiği */}
                <Text style={styles.chartTitle}>Gider Dağılımı (Ödeme Yöntemi)</Text>
                {pieChartData.length > 0 ? (
                    <View style={styles.chartWrapper}>
                        <PieChart
                            data={pieChartData}
                            width={screenWidth - 48} // Wrapper padding'ini hesaba kat
                            height={230} // Yüksekliği biraz artırdık
                            chartConfig={{ // PieChart kendi chartConfig'ini alabilir (opsiyonel)
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Legend rengi buradan ayarlanmıyor
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor={"amount"}
                            backgroundColor={"transparent"}
                            paddingLeft={"10"} // Biraz sola çektik
                            // center={[screenWidth / 4 - 10, 0]} // Ortalamayı dene (cihaza göre değişebilir)
                            absolute // Değerleri göster
                            avoidFalseZero // 0 değerleri için %0 yerine boşluk bırakabilir
                            style={{ borderRadius: 16 }} // Wrapper ile uyumlu
                            // hasLegend={false} // Legend'ı gizlemek istersen
                        />
                    </View>
                ) : (
                    <Text style={styles.noDataText}>Gider verisi bulunamadı.</Text>
                )}


                {/* Gelir vs Gider Grafiği */}
                <Text style={styles.chartTitle}>Toplam Gelir ve Gider</Text>
                {barChartData.datasets[0].data.some(d => d > 0) ? (
                    <View style={styles.chartWrapper}>
                        <BarChart
                            data={barChartData}
                            width={screenWidth - 48} // Wrapper padding'ini hesaba kat
                            height={250}
                            yAxisLabel="₺ " // Biraz boşluk
                            yAxisSuffix=""
                            chartConfig={chartConfig} // Yukarıda tanımladığımız config'i kullan
                            style={styles.chartStyle}
                            verticalLabelRotation={0}
                            showValuesOnTopOfBars={true}
                            fromZero={true}
                            // Barların renklerini özelleştirmek istersen (opsiyonel)
                            // withCustomBarColorFromData={true}
                            // data={{
                            //     ...barChartData,
                            //     datasets: [{
                            //         ...barChartData.datasets[0],
                            //         colors: [ (opacity = 1) => `#28a745`, (opacity = 1) => `#dc3545` ] // Gelir yeşil, Gider kırmızı
                            //     }]
                            // }}
                        />
                     </View>
                ) : (
                   <Text style={styles.noDataText}>Gelir veya gider verisi bulunamadı.</Text>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// Stilleri güncelleyelim
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 40,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26, // Biraz küçülttük
        fontWeight: 'bold',
        color: '#1F2937', // Tailwind gray-800
        marginBottom: 25, // Boşluğu artırdık
        textAlign: 'center'
    },
    chartTitle: {
        fontSize: 18, // Biraz küçülttük
        fontWeight: '600',
        color: '#374151', // Tailwind gray-700
        marginTop: 25,
        marginBottom: 15,
        textAlign: 'center'
    },
    chartWrapper: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingVertical: 16, // İç boşluk
        paddingHorizontal: 8, // Yanlardan hafif boşluk
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, // Gölgeyi azalttık
        shadowRadius: 6,
        elevation: 2, // Android için gölge
        width: screenWidth - 32, // Konteyner genişliği
        alignItems: 'center', // İçindeki grafiği ortala
    },
    chartStyle: { // BarChart için özel stil
        borderRadius: 16, // Köşeleri yuvarla
        // Grafik kütüphanesi kendi padding'ini yönettiği için buraya eklemeye gerek yok
    },
    noDataText: {
        textAlign: 'center',
        color: '#6B7280', // Tailwind gray-500
        marginTop: 20,
        fontSize: 15,
        paddingHorizontal: 20,
    }
});