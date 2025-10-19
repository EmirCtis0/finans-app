// app/(tabs)/reports.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTransactions, Transaction } from '../../src/services/transactionService';

const screenWidth = Dimensions.get("window").width;

// Rastgele renk üretici
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export default function ReportsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getTransactions();
            setTransactions(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    const expenseByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
            const category = transaction.category;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += Math.abs(transaction.amount);
            return acc;
        }, {} as Record<string, number>);
    
    const pieChartData = Object.keys(expenseByCategory).map(category => ({
        name: category,
        amount: expenseByCategory[category],
        color: getRandomColor(),
        legendFontColor: '#7F7F7F',
        legendFontSize: 14,
    }));

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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.headerTitle}>Finans Raporları</Text>

                <Text style={styles.chartTitle}>Giderlerin Kategorilere Göre Dağılımı</Text>
                {pieChartData.length > 0 ? (
                    <PieChart
                        data={pieChartData}
                        width={screenWidth - 32}
                        height={220}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                        }}
                        accessor={"amount"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <Text style={styles.noDataText}>Gider verisi bulunamadı.</Text>
                )}

                <Text style={styles.chartTitle}>Toplam Gelir ve Gider</Text>
                <BarChart
                    data={barChartData}
                    width={screenWidth - 32}
                    height={250}
                    yAxisLabel="₺"
                    yAxisSuffix="" // <-- HATA İÇİN EKLENEN SATIR
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                    showValuesOnTopOfBars
                    fromZero
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        padding: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 20,
        textAlign: 'center'
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center'
    },
    noDataText: {
        textAlign: 'center',
        color: '#6c757d',
        marginTop: 20,
        fontSize: 16,
    }
});