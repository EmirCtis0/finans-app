// app/addTransactionModal.tsx
// İmportları yeni tiplere göre güncelle
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform, ScrollView // ScrollView eklendi
  ,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { addTransaction, AppTransactionCreatePayload } from '../src/services/transactionService';

// PaymentMethod tipi artık sadece string olabilir veya belirli enumlar
type PaymentMethod = 'Nakit' | 'Kredi Kartı' | 'Banka Transferi' | string;

export default function AddTransactionModal() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isIncome, setIsIncome] = useState(false); // false = Gider, true = Gelir
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Nakit');
  const [date, setDate] = useState(new Date()); // Varsayılan tarih: şimdi
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Tarih seçici değiştiğinde çalışacak fonksiyon
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    // Android'de picker'ı seçtikten sonra otomatik kapanır, iOS'ta açık kalır.
    // iOS için gizlemeyi yönetmeye gerek yok, kullanıcı dışarı tıklayabilir.
    setShowDatePicker(Platform.OS === 'ios'); // iOS'ta true kalsın, Android'de kapansın
    if (event.type === "set") { // Sadece 'tamam'a basıldığında tarihi güncelle (Android için önemli)
        setDate(currentDate);
    } else {
        // Cancel'a basıldıysa picker'ı kapat (Android)
        setShowDatePicker(false);
    }
  };

  // Kaydetme işlemi
  const handleSave = async () => {
    // Virgülü noktaya çevirerek ondalık sayıya dönüştürme
    const numericAmount = parseFloat(amount.replace(',', '.'));

    // Gerekli alanların kontrolü
    if (!description || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Hata', 'Lütfen Açıklama ve geçerli bir Tutar girin.');
      return;
    }
    if (!paymentMethod) {
       Alert.alert('Hata', 'Lütfen bir ödeme tipi seçin.');
       return;
    }

    // API'ye gönderilecek veriyi oluştur
    const dataToSend: AppTransactionCreatePayload = {
      description,
      amount: isIncome ? numericAmount : -numericAmount, // Tipe göre işareti ayarla
      type: isIncome ? 'income' : 'expense',
      // category: 'Default', // TODO: Kategori API'de netleşince burası güncellenecek
      payee: payee || undefined, // Boşsa undefined gönder
      paymentMethod: paymentMethod, // Seçilen ödeme tipi
      date: date, // Seçilen tarih (Date objesi)
    };

    try {
      // addTransaction fonksiyonunu çağır
      const successTransaction = await addTransaction(dataToSend);

      // Eğer işlem başarılıysa (null dönmediyse) geri git
      if (successTransaction && router.canGoBack()) {
        router.back();
        // TODO: Geri döndükten sonra Dashboard'un otomatik yenilenmesi eklenebilir
        // (örneğin bir event emitter veya state management ile)
      }
      // Hata varsa zaten addTransaction içinde Alert gösteriliyor.
    } catch (error) {
      // Genellikle buraya düşmemesi lazım ama garanti olsun diye loglama
      console.error("Error in handleSave (should have been caught in service):", error);
       Alert.alert('Beklenmedik Hata', 'İşlem kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    // Klavye açıldığında içeriğin kaydırılabilmesi için ScrollView ekledik
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Yeni İşlem</Text>

      <TextInput
        placeholder="Açıklama (Örn: Kahve, Fatura)"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        placeholder="Firma / Kişi (Opsiyonel)"
        style={styles.input}
        value={payee}
        onChangeText={setPayee}
      />
      <TextInput
        placeholder="Tutar (Örn: 150,75)"
        style={styles.input}
        value={amount}
        onChangeText={(text) => setAmount(text.replace('.', ','))} // Noktayı virgüle çevir
        keyboardType="numeric"
      />

      {/* Gelir / Gider Seçimi */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, !isIncome && styles.activeText]}>Gider</Text>
        <Switch
          trackColor={{ false: "#ffcccb", true: "#90ee90" }} // Daha soft renkler
          thumbColor={isIncome ? "#28a745" : "#dc3545"}
          ios_backgroundColor="#e0e0e0"
          onValueChange={() => setIsIncome(previousState => !previousState)}
          value={isIncome}
        />
        <Text style={[styles.switchLabel, isIncome && styles.activeText]}>Gelir</Text>
      </View>

      {/* Ödeme Tipi Seçimi */}
      <Text style={styles.label}>Ödeme Tipi</Text>
      <View style={styles.paymentMethodContainer}>
        {(['Nakit', 'Kredi Kartı', 'Banka Transferi'] as PaymentMethod[]).map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.paymentMethodButton, paymentMethod === method && styles.paymentMethodButtonActive]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={[styles.paymentMethodText, paymentMethod === method && styles.paymentMethodTextActive]}>{method}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tarih Seçimi */}
      <Text style={styles.label}>İşlem Tarihi</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>
          {date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })} - {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {/* Tarih Seçici Component'i (Platforma göre farklı görünebilir) */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode={'datetime'} // Hem tarih hem saat
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} // iOS'ta tekerlekli, Android'de varsayılan
          onChange={onDateChange}
          // Android için maksimum tarih (geleceği seçmeyi engellemek için - opsiyonel)
          // maximumDate={new Date()}
        />
      )}

      {/* Kaydet Butonu */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Stiller
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: { // ScrollView içeriği için padding
    padding: 20,
    paddingBottom: 40, // Altta boşluk
  },
  title: {
    fontSize: 26, // Biraz küçülttük
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333'
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 12, // Yüksekliği azalttık
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333', // Yazı rengi
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20, // Boşluğu artırdık
    paddingVertical: 10,
    backgroundColor: '#fff', // Arka plan ekledik
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  switchLabel: {
    fontSize: 16, // Biraz küçülttük
    marginHorizontal: 15, // Boşluğu artırdık
    color: '#aaa',
    fontWeight: '500'
  },
  activeText: {
    color: '#333', // Aktif yazı rengi
    fontWeight: 'bold'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8, // Boşluğu azalttık
    marginTop: 15, // Üst boşluk
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25, // Boşluğu artırdık
  },
  paymentMethodButton: {
    flex: 1, // Eşit dağılım
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5, // Biraz kalınlaştırdık
    borderColor: '#ccc',
    alignItems: 'center',
    marginHorizontal: 4
  },
  paymentMethodButtonActive: {
    backgroundColor: '#ede9fe', // Açık mor arka plan
    borderColor: '#7c3aed' // Mor kenarlık
  },
  paymentMethodText: {
    color: '#555', // Daha koyu gri
    fontWeight: '500',
    fontSize: 14, // Biraz küçülttük
  },
  paymentMethodTextActive: {
    color: '#7c3aed' // Mor yazı rengi
  },
  datePickerButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30
  },
  datePickerText: {
    fontSize: 16,
    color: '#333'
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16, // Yüksekliği artırdık
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000", // Gölge ekledik
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10, // Tarih seçiciden sonra boşluk
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});