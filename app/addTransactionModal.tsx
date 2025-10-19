// app/addTransactionModal.tsx
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
import { addTransaction } from '../src/services/transactionService';

export default function AddTransactionModal() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isIncome, setIsIncome] = useState(false); // false = Gider, true = Gelir

  const handleSave = async () => {
    // Virgülü noktaya çevirerek ondalık sayıya dönüştürme
    const numericAmount = parseFloat(amount.replace(',', '.'));
    
    // Alanların dolu ve geçerli olup olmadığını kontrol et
    if (!description || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doğru bir şekilde doldurun.');
      return;
    }

    try {
      // Servis fonksiyonunu çağırırken artık 'category' alanını da ekliyoruz
      await addTransaction({
        description,
        amount: isIncome ? numericAmount : -numericAmount,
        type: isIncome ? 'income' : 'expense',
        // Gelir ise 'Salary', Gider ise varsayılan olarak 'Shopping' kategorisini ata
        category: isIncome ? 'Salary' : 'Shopping', 
      });
      
      // İşlem başarılıysa bir önceki ekrana dön
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni İşlem Ekle</Text>

      <TextInput
        placeholder="Açıklama (Örn: Market Alışverişi)"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        placeholder="Tutar (Örn: 150.75)"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Gider</Text>
        <Switch
          trackColor={{ false: "#dc3545", true: "#28a745" }}
          thumbColor={Platform.OS === 'android' ? "#f4f3f4" : undefined}
          onValueChange={() => setIsIncome(previousState => !previousState)}
          value={isIncome}
        />
        <Text style={styles.switchLabel}>Gelir</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  switchLabel: {
    fontSize: 18,
    marginHorizontal: 10,
    color: '#333'
  },
  button: {
    backgroundColor: '#7c3aed',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});