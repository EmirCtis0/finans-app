// src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Sadece ana Ngrok adresini kullanıyoruz, sonunda / yok
  baseURL: 'https://nonforensic-glisteringly-hannah.ngrok-free.dev', // <-- GÜNCELLENDİ (/api silindi)
  timeout: 15000, // Zaman aşımını biraz artırdım
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Ngrok uyarısını geçmek için eklendi
  },
});

export default api;