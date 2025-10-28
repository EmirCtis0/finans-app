// src/services/transactionService.ts
import { isAxiosError } from 'axios';
import { Alert } from 'react-native';
import api from './api';

// Mobil uygulamada kullanacağımız veri yapısı
export interface AppTransaction {
  id: number;
  description: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
  category?: string; // API'de yok, Yusuf'a sor!
  paymentMethod: string;
  payee?: string;
}

// API'den gelen Transaction objesinin tipi
interface ApiTransaction {
  id: number;
  user_id: number;
  type: string;
  payment_type: string | null;
  amount: number;
  product_name: string | null;
  description: string | null;
  company_person: string | null;
  transaction_description: string | null;
  date: string; // ISO formatında string
}

// API'ye yeni işlem gönderirken kullanılacak veri tipi
interface ApiTransactionCreate {
  user_id: number;
  type: 'income' | 'expense';
  payment_type: string | null;
  amount: number;
  product_name: string | null;
  description: string | null;
  company_person: string | null;
  transaction_description: string | null;
  date?: string | null; // ISO formatında string
}

// Mobil uygulama içinden yeni işlem eklerken kullanılacak tip
export type AppTransactionCreatePayload = {
    description: string;
    amount: number;
    date: Date;
    type: 'income' | 'expense';
    category?: string;
    paymentMethod: string;
    payee?: string;
};

// --- API FONKSİYONLARI ---

export const getTransactions = async (): Promise<AppTransaction[]> => {
  try {
    console.log('Fetching transactions from API (GET /transactions/)...');
    const response = await api.get<ApiTransaction[]>('/transactions/');
    console.log('Raw API Response:', response.data);

    if (!Array.isArray(response.data)) {
        console.error("API did not return an array:", response.data);
        Alert.alert("Veri Hatası", "API'den beklenmeyen formatta veri geldi.");
        return [];
    }

    const formattedData: AppTransaction[] = response.data
      .map((tx: ApiTransaction): AppTransaction | null => {
        if (!tx || typeof tx.id === 'undefined' || typeof tx.amount === 'undefined') {
            console.warn('Skipping invalid transaction data:', tx);
            return null;
        }
        return {
            id: tx.id,
            description: tx.product_name || tx.transaction_description || tx.description || 'Açıklama Yok',
            amount: tx.amount,
            date: tx.date ? new Date(tx.date) : new Date(),
            type: tx.type === 'income' || tx.type === 'gelir' ? 'income' : 'expense', // API'den "gelir"/"gider" gelebilir
            paymentMethod: tx.payment_type || 'Bilinmiyor',
            payee: tx.company_person || undefined,
            // category: tx.product_name ?? 'Diğer', // TODO: Yusuf'a category alanını sor!
        };
      })
      .filter((tx): tx is AppTransaction => tx !== null)
      .sort((a: AppTransaction, b: AppTransaction) => b.date.getTime() - a.date.getTime());

    console.log('Mapped Data for App:', formattedData);
    return formattedData;

  } catch (error) {
    console.error("Error fetching transactions from API:", error);
    if (isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data || error.message);
        const errorDetail = error.response?.data?.detail || error.message;
        Alert.alert("Veri Alınamadı", `İşlemler yüklenirken bir sorun oluştu: ${errorDetail}`);
    } else {
        Alert.alert("Veri Alınamadı", "İşlemler yüklenirken bilinmeyen bir sorun oluştu.");
    }
    return [];
  }
};

export const addTransaction = async (appData: AppTransactionCreatePayload): Promise<AppTransaction | null> => {
    const apiPayload: ApiTransactionCreate = {
        user_id: 1, // !!! GEÇİCİ: Login'den sonra dinamik olmalı!
        type: appData.type,
        amount: appData.amount,
        payment_type: appData.paymentMethod || null,
        product_name: appData.description || null,
        description: null,
        company_person: appData.payee || null,
        transaction_description: null,
        date: appData.date.toISOString(),
    };

    try {
        console.log('Adding transaction via API (POST /transactions/) with payload:', apiPayload);
        const response = await api.post<ApiTransaction>('/transactions/', apiPayload);
        console.log('API Add Response:', response.data);
        Alert.alert("Başarılı", "İşlem başarıyla eklendi.");

        const newTransaction: AppTransaction = {
            id: response.data.id,
            description: response.data.product_name || response.data.transaction_description || response.data.description || 'Açıklama Yok',
            amount: response.data.amount,
            date: response.data.date ? new Date(response.data.date) : new Date(),
            type: response.data.type === 'income' || response.data.type === 'gelir' ? 'income' : 'expense', // API'den "gelir"/"gider" gelebilir
            paymentMethod: response.data.payment_type || 'Bilinmiyor',
            payee: response.data.company_person || undefined,
            // category: response.data.product_name ?? 'Diğer', // TODO: Category alanı netleşmeli
        };
        return newTransaction;

    } catch (error) {
        console.error("Error adding transaction via API:", error);
         if (isAxiosError(error)) {
            const errorDetail = error.response?.data?.detail || error.message;
            console.error("Axios error details:", errorDetail);
             if (Array.isArray(errorDetail)) {
                 const messages = errorDetail.map((err: any) => {
                     const field = err.loc && err.loc.length > 1 ? err.loc[1] : 'Bilinmeyen Alan';
                     return `${field}: ${err.msg}`;
                 }).join('\n');
                 Alert.alert("İşlem Başarısız", `Lütfen alanları kontrol edin:\n${messages}`);
             } else {
                 Alert.alert("İşlem Başarısız", `Bir sorun oluştu: ${errorDetail}`);
             }
        } else {
             Alert.alert("İşlem Başarısız", "Beklenmedik bir sorun oluştu.");
        }
        return null;
    }
};

/**
 * Belirtilen ID'ye sahip işlemi silmek için API'ye istek gönderir.
 * @param id Silinecek işlemin ID'si (API number bekliyor)
 * @returns Başarılı olursa true, başarısız olursa false döner.
 */
export const deleteTransaction = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting transaction with ID: ${id} via API (DELETE /transactions/${id})...`);
    // API dokümanına göre endpoint: /transactions/{transaction_id} ve metod: DELETE
    const response = await api.delete(`/transactions/${id}`);
    console.log('API Delete Response Status:', response.status);

    // Başarılı HTTP status kodları (200 OK veya 204 No Content)
    if (response.status === 200 || response.status === 204) {
        Alert.alert("Başarılı", "İşlem başarıyla silindi.");
        return true; // Başarılı
    } else {
        // Normalde 200/204 dışındaki durumlar hataya düşer ama garanti olsun
        Alert.alert("Uyarı", `İşlem silindi ancak sunucudan beklenmedik bir yanıt alındı: ${response.status}`);
        return true;
    }

  } catch (error) {
    console.error(`Error deleting transaction with ID: ${id} via API:`, error);
    if (isAxiosError(error)) {
        // API 404 Not Found dönebilir (silinmek istenen ID yoksa) veya başka hatalar
        const errorDetail = error.response?.data?.detail || error.message;
        console.error("Axios error details:", errorDetail);
        Alert.alert("Silme Başarısız", `İşlem silinirken bir sorun oluştu: ${errorDetail}`);
    } else {
        Alert.alert("Silme Başarısız", "İşlem silinirken bilinmeyen bir sorun oluştu.");
    }
    return false; // Başarısız
  }
};