    // src/services/authService.ts
    import { isAxiosError } from 'axios';
import { Alert } from 'react-native';
import api from './api';

    // API'ye gönderilecek UserCreate modeli (openapi.json'dan)
    interface ApiUserCreate {
    name: string;
    email: string;
    // Şifre API dokümanında görünmüyor ama muhtemelen gereklidir. Yusuf'a sor!
    // Şimdilik ekleyelim.
    password?: string;
    }

    // API'den dönen User modeli (openapi.json'dan)
    interface ApiUser {
    name: string;
    email: string;
    id: number;
    }

    /**
     * Yeni kullanıcı kaydı için API'ye istek gönderir.
     * @param name Kullanıcının adı
     * @param email Kullanıcının e-postası
     * @param password Kullanıcının şifresi
     * @returns Başarılı olursa true, başarısız olursa false döner.
     */
    export const registerUser = async (name: string, email: string, password?: string): Promise<boolean> => {
    const payload: ApiUserCreate = { name, email, password }; // Şifreyi ekledik (varsayım)
    console.log('Registering user via API (POST /users/) with payload:', { name, email, password: '***' }); // Şifreyi loglama

    try {
        // API dokümanına göre endpoint /users/ ve POST metodu
        const response = await api.post<ApiUser>('/users/', payload);
        console.log('API Register Response:', response.data);

        // Başarılı yanıtı kontrol et (genellikle 200 OK veya 201 Created döner)
        if (response.status === 200 || response.status === 201) {
        return true; // Başarılı
        } else {
        Alert.alert("Uyarı", `Kayıt başarılı ancak sunucudan beklenmedik bir yanıt alındı: ${response.status}`);
        return true; // Yine de başarılı kabul edelim
        }

    } catch (error) {
        console.error("Error registering user via API:", error);
        if (isAxiosError(error)) {
        const errorDetail = error.response?.data?.detail || error.message;
        console.error("Axios error details:", errorDetail);
        // FastAPI validation hataları
        if (Array.isArray(errorDetail)) {
            const messages = errorDetail.map((err: any) => `${err.loc?.slice(-1)[0]}: ${err.msg}`).join('\n'); // Sadece son field adı
            Alert.alert("Kayıt Başarısız", `Lütfen bilgileri kontrol edin:\n${messages}`);
        } else if (typeof errorDetail === 'string' && errorDetail.includes('already exists')) {
            Alert.alert("Kayıt Başarısız", "Bu e-posta adresi zaten kullanılıyor.");
        }
        else {
            Alert.alert("Kayıt Başarısız", `Bir sorun oluştu: ${errorDetail}`);
        }
        } else {
        Alert.alert("Kayıt Başarısız", "Beklenmedik bir sorun oluştu.");
        }
        return false; // Başarısız
    }
    };

    // TODO: Login fonksiyonu da buraya eklenecek.
    // export const loginUser = async (email: string, password: string): Promise<{ token: string, user: ApiUser } | null> => { ... }
    