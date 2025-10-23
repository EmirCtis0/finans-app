// src/services/transactionService.ts
import { isAxiosError } from 'axios';
import { Alert } from 'react-native';
import api from './api';

// --- API ŞEMASINA GÖRE GÜNCELLENMİŞ Transaction Interface ---
// Mobil uygulamada kullanacağımız veri yapısı. API'den gelen veriyi buna çevireceğiz.
export interface AppTransaction {
  id: number;
  description: string; // API'deki product_name veya transaction_description'ı buraya atayacağız
  amount: number;
  date: Date; // Date objesi olarak kullanacağız
  type: 'income' | 'expense'; // Tipi netleştirelim
  category?: string; // API'de category yok gibi, şimdilik opsiyonel? Yoksa product_name mi category? Yusuf'a sor!
  paymentMethod: string; // API'deki payment_type buraya gelecek
  payee?: string; // API'deki company_person buraya gelecek
  // API'den gelen ama UI'da direkt göstermeyeceğimiz alanlar (gerekirse eklenir):
  // userId: number;
  // apiDescription?: string; // API'deki description alanı
  // apiTransactionDescription?: string; // API'deki transaction_description alanı
}

// API'den gelen Transaction objesinin tipi (Şemaya göre)
interface ApiTransaction {
  id: number;
  user_id: number;
  type: string; // 'income' veya 'expense' olmalı
  payment_type: string | null;
  amount: number;
  product_name: string | null;
  description: string | null;
  company_person: string | null;
  transaction_description: string | null;
  date: string; // ISO formatında string
}

// API'ye yeni işlem gönderirken kullanılacak veri tipi (TransactionCreate şemasına göre)
interface ApiTransactionCreate {
  user_id: number; // Bu ID'yi nereden alacağız? Şimdilik sabit bir değer varsayalım.
  type: 'income' | 'expense';
  payment_type: string | null;
  amount: number;
  product_name: string | null;
  description: string | null;
  company_person: string | null;
  transaction_description: string | null;
  date?: string | null; // ISO formatında string
}

// --- GÜNCELLENMİŞ FONKSİYONLAR ---

// Tüm işlemleri API'den getiren fonksiyon
export const getTransactions = async (): Promise<AppTransaction[]> => {
  try {
    console.log('Fetching transactions from API (GET /transactions/)...');
    // API direkt liste döndürüyor, { data: ... } yapısı yok
    const response = await api.get<ApiTransaction[]>('/transactions/');
    console.log('Raw API Response:', response.data);

    if (!Array.isArray(response.data)) {
        console.error("API did not return an array:", response.data);
        Alert.alert("Veri Hatası", "API'den beklenmeyen formatta veri geldi.");
        return [];
    }

    // API verisini mobil uygulamada kullanacağımız formata çevirelim (Mapping)
    const formattedData: AppTransaction[] = response.data
      .map((tx: ApiTransaction): AppTransaction => ({
        id: tx.id,
        // Ana açıklama olarak product_name'i alalım, yoksa transaction_description, o da yoksa API'nin description'ı
        description: tx.product_name || tx.transaction_description || tx.description || 'Açıklama Yok',
        amount: tx.amount,
        date: tx.date ? new Date(tx.date) : new Date(),
        // API'den gelen type 'income' veya 'expense' değilse default 'expense' yapalım
        type: tx.type === 'income' ? 'income' : 'expense',
        paymentMethod: tx.payment_type || 'Bilinmiyor', // payment_type -> paymentMethod
        payee: tx.company_person || undefined, // company_person -> payee
        // category: tx.product_name ?? 'Diğer', // category alanı API'de yok, product_name'i kullanabiliriz? Yusuf'a sor!
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Yeniye göre sırala

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

// Mobil uygulama içinden yeni işlem eklerken kullanılacak tip
// Bu, formdan gelen veriyi temsil eder
export type AppTransactionCreatePayload = {
    description: string;
    amount: number;
    date: Date;
    type: 'income' | 'expense';
    category?: string; // Formda category yoksa bile API'ye ne göndereceğiz?
    paymentMethod: string;
    payee?: string;
};

// Yeni işlem ekleyen fonksiyon
export const addTransaction = async (appData: AppTransactionCreatePayload): Promise<AppTransaction | null> => {
    // Mobil verisini API'nin beklediği formata çevirelim (Mapping)
    const apiPayload: ApiTransactionCreate = {
        user_id: 1, // !!! GEÇİCİ: Bu ID nereden gelecek? Login işleminden sonra alınmalı! Yusuf'a sor!
        type: appData.type,
        amount: appData.amount, // Pozitif/negatifliği zaten formda ayarlamıştık
        payment_type: appData.paymentMethod, // paymentMethod -> payment_type
        product_name: appData.description, // Ana açıklama product_name'e gitsin
        description: null, // API'deki description alanına şimdilik null gönderelim
        company_person: appData.payee || null, // payee -> company_person
        transaction_description: null, // Şimdilik null
        date: appData.date.toISOString(), // Date objesini ISO string'e çevir
    };

    try {
        console.log('Adding transaction via API (POST /transactions/) with payload:', apiPayload);
        const response = await api.post<ApiTransaction>('/transactions/', apiPayload);
        console.log('API Add Response:', response.data);
        Alert.alert("Başarılı", "İşlem başarıyla eklendi.");

        // API'den dönen yanıtı mobil uygulama formatına çevirelim
        const newTransaction: AppTransaction = {
            id: response.data.id,
            description: response.data.product_name || response.data.transaction_description || response.data.description || 'Açıklama Yok',
            amount: response.data.amount,
            date: response.data.date ? new Date(response.data.date) : new Date(),
            type: response.data.type === 'income' ? 'income' : 'expense',
            paymentMethod: response.data.payment_type || 'Bilinmiyor',
            payee: response.data.company_person || undefined,
            // category: response.data.product_name ?? 'Diğer', // Category?
        };
        return newTransaction;

    } catch (error) {
        console.error("Error adding transaction via API:", error);
         if (isAxiosError(error)) {
            const errorDetail = error.response?.data?.detail || error.message;
            console.error("Axios error details:", errorDetail);
             if (Array.isArray(errorDetail)) {
                 const messages = errorDetail.map((err: any) => `${err.loc?.join(' -> ')}: ${err.msg}`).join('\n');
                 Alert.alert("İşlem Başarısız", `Lütfen alanları kontrol edin:\n${messages}`);
             } else {
                 Alert.alert("İşlem Başarısız", `Bir sorun oluştu: ${errorDetail}`);
             }
        } else {
             Alert.alert("İşlem Başarısız", "Bilinmeyen bir sorun oluştu.");
        }
        return null;
    }
};