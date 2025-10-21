// app/addTransactionModal.tsx
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { addTransaction, Transaction } from '../src/services/transactionService';

type PaymentMethod = Transaction['paymentMethod'];

export default function AddTransactionModal() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Nakit');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    // Android'de picker'ı gizle, iOS'ta zaten hep açık
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Hata', 'Lütfen Açıklama ve Tutar alanlarını doldurun.');
      return;
    }

    try {
      await addTransaction({
        description,
        amount: isIncome ? numericAmount : -numericAmount,
        type: isIncome ? 'income' : 'expense',
        category: isIncome ? 'Salary' : 'Shopping', // Bu ileride geliştirilebilir
        payee: payee || undefined,
        paymentMethod,
        date,
      });
      
      if (router.canGoBack()) router.back();
    } catch (error) {
      Alert.alert('Hata', 'İşlem kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni İşlem</Text>

      <TextInput
        placeholder="Açıklama (Örn: Kahve, T-shirt)"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        placeholder="Firma / Kişi (Örn: Starbucks)"
        style={styles.input}
        value={payee}
        onChangeText={setPayee}
      />
      <TextInput
        placeholder="Tutar (Örn: 150.75)"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, !isIncome && styles.activeText]}>Gider</Text>
        <Switch
          trackColor={{ false: "#e0e0e0", true: "#e0e0e0" }}
          thumbColor={isIncome ? "#28a745" : "#dc3545"}
          onValueChange={() => setIsIncome(previousState => !previousState)}
          value={isIncome}
        />
        <Text style={[styles.switchLabel, isIncome && styles.activeText]}>Gelir</Text>
      </View>

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

      <Text style={styles.label}>İşlem Tarihi</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>{date.toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode={'datetime'}
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#333' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
  switchLabel: { fontSize: 18, marginHorizontal: 10, color: '#aaa', fontWeight: '500' },
  activeText: { color: '#000', fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10, marginTop: 10 },
  paymentMethodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  paymentMethodButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', marginHorizontal: 4 },
  paymentMethodButtonActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  paymentMethodText: { color: '#333', fontWeight: '500' },
  paymentMethodTextActive: { color: 'white' },
  datePickerButton: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  datePickerText: { fontSize: 16, color: '#333' },
  saveButton: { backgroundColor: '#7c3aed', padding: 18, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});