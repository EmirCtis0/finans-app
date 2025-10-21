// src/services/transactionService.ts

// Yeni alanları içeren güncellenmiş Transaction tipi
export interface Transaction {
  id: string;
  description: string; // Ürün adı / İşlem açıklaması
  amount: number;
  date: Date; // Tarih ve saat tutabilmesi için Date objesi yaptık
  type: 'income' | 'expense';
  category: 'Salary' | 'Groceries' | 'Coffee' | 'Bills' | 'Shopping' | 'Freelance';
  paymentMethod: 'Nakit' | 'Kredi Kartı' | 'Banka Transferi';
  payee?: string; // Firma/Kişi, opsiyonel
}

// Örnek verileri yeni alanlarla güncelleyelim
const dummyTransactions: Transaction[] = [
  { id: '1', description: 'Aylık Maaş', amount: 5000.00, date: new Date(), type: 'income', category: 'Salary', paymentMethod: 'Banka Transferi', payee: 'FugeVet A.Ş.' },
  { id: '2', description: 'Market Alışverişi', amount: -250.00, date: new Date(new Date().setDate(new Date().getDate() - 1)), type: 'expense', category: 'Groceries', paymentMethod: 'Kredi Kartı', payee: 'Bim' },
  { id: '3', description: 'Kahve', amount: -75.00, date: new Date(new Date().setDate(new Date().getDate() - 2)), type: 'expense', category: 'Coffee', paymentMethod: 'Kredi Kartı', payee: 'Espresso Lab' },
  { id: '4', description: 'Elektrik Faturası', amount: -150.00, date: new Date(new Date().setDate(new Date().getDate() - 3)), type: 'expense', category: 'Bills', paymentMethod: 'Banka Transferi', payee: 'Enerjisa' },
];

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([...dummyTransactions].sort((a, b) => b.date.getTime() - a.date.getTime()));
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// addTransaction fonksiyonu artık yeni alanları da kabul ediyor
export const addTransaction = async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
        const newTransaction: Transaction = {
            id: Math.random().toString(),
            ...transactionData
        };
        dummyTransactions.unshift(newTransaction);
        return new Promise(resolve => setTimeout(() => resolve(newTransaction), 500));
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
    }
};