// src/services/transactionService.ts

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: 'Salary' | 'Groceries' | 'Coffee' | 'Bills' | 'Shopping'; // Kategori ekledik
}

// Örnek verileri güncelleyelim
const dummyTransactions: Transaction[] = [
  { id: '1', description: 'Salary', amount: 5000.00, date: '10/10/2025', type: 'income', category: 'Salary' },
  { id: '2', description: 'Groceries', amount: -250.00, date: '10/10/2025', type: 'expense', category: 'Groceries' },
  { id: '3', description: 'Coffee with friends', amount: -75.00, date: '10/10/2025', type: 'expense', category: 'Coffee' },
  { id: '4', description: 'Electric Bill', amount: -150.00, date: '09/10/2025', type: 'expense', category: 'Bills' },
  { id: '5', description: 'New T-shirt', amount: -120.00, date: '08/10/2025', type: 'expense', category: 'Shopping' },
  { id: '6', description: 'Freelance Project', amount: 750.00, date: '07/10/2025', type: 'income', category: 'Salary' },
];

// Tüm işlemleri getiren fonksiyon
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    // Gerçek API bağlantısı için bu satırları açabilirsin:
    // const response = await api.get('/transactions');
    // return response.data;

    // Şimdilik örnek veriyi 1 saniye gecikmeyle döndürelim.
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(dummyTransactions);
      }, 1000);
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return []; // Hata durumunda boş dizi döndür.
  }
};

// Yeni işlem ekleyen fonksiyon
export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    try {
        // Gerçek API bağlantısı için bu satırları açabilirsin:
        // const response = await api.post('/transactions', transactionData);
        // return response.data;

        // Örnek ekleme işlemi
        const newTransaction: Transaction = {
            id: Math.random().toString(),
            date: new Date().toLocaleDateString('tr-TR'),
            ...transactionData
        };
        console.log("Adding transaction:", newTransaction);
        // Yeni veriyi listeye ekleyelim (Bu kısım normalde state management ile yapılır)
        dummyTransactions.unshift(newTransaction);
        return new Promise(resolve => setTimeout(() => resolve(newTransaction), 500));

    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error; // Hata durumunda hatayı fırlat.
    }
};