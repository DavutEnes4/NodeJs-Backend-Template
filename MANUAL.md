# Deneyap API Projesi - Kullanım Kılavuzu

Bu proje, Node.js, Express ve MongoDB kullanılarak geliştirilmiş, güvenli bir REST API şablonudur.

## İçindekiler
1. [Kurulum](#1-kurulum)
2. [Yapılandırma (.env)](#2-yapılandırma-env)
3. [Çalıştırma](#3-çalıştırma)
4. [Proje Yapısı](#4-proje-yapısı)
5. [API Kullanımı](#5-api-kullanımı)
   - Kayıt ve Giriş
   - Token Yenileme (Refresh)
   - Korumalı Rotalar

---

## 1. Kurulum

Öncelikle bilgisayarınızda **Node.js** ve **MongoDB** kurulu olmalıdır.

Proje klasöründe terminali açın ve bağımlılıkları yükleyin:
```bash
npm install
```

## 2. Yapılandırma (.env)

Proje ana dizininde `.env` dosyası oluşturun (veya `.env.example` dosyasını kopyalayın).

```bash
cp .env.example .env
```

İçeriğini düzenleyin:
```ini
PORT=3000
MONGO_URI=mongodb://localhost:27017/deneyap_deneme

# Güvenlik için RASTGELE ve ZOR tahmin edilebilir anahtarlar kullanın!
JWT_ACCESS_SECRET=cok_gizli_ozel_access_anahtari
JWT_REFRESH_SECRET=cok_gizli_ozel_refresh_anahtari

# Token Süreleri
JWT_ACCESS_EXPIRES_IN=15m  # Access token kısa ömürlüdür
JWT_REFRESH_EXPIRES_IN=7d  # Refresh token daha uzun ömürlüdür

# --- Gelişmiş Ayarlar (Advanced Settings) ---

# Varsayılan Kullanıcı Rolü (Kayıt olanlar bu rolü alır)
DEFAULT_USER_ROLE=user

# Şifreleme Zorluğu (Yüksek = Güvenli ama Yavaş)
BCRYPT_SALT_ROUNDS=10

# SSL Yolları
SSL_KEY_PATH=certs/key.pem
SSL_CERT_PATH=certs/cert.pem

# --- Rate Limiting (Hız Sınırlama) ---
# Varsayılan olarak KAPALI (false). Açmak için true yapın.
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000 # 15 dakika (ms)
RATE_LIMIT_MAX=100          # 15 dakikada 100 istek limiti
```

### Rate Limiting Nasıl Etkinleştirilir?
Saldırıları önlemek için `.env` dosyasında `RATE_LIMIT_ENABLED=true` yapmanız yeterlidir. Varsayılan olarak her IP adresi 15 dakika içinde en fazla 100 istek atabilir. Bu limitleri `RATE_LIMIT_WINDOW_MS` ve `RATE_LIMIT_MAX` ile değiştirebilirsiniz.

## 3. Çalıştırma

Geliştirme modunda (nodemon ile):
```bash
npm run dev
```

Normal başlatma:
```bash
npm start
```

## 4. Proje Yapısı

- `src/app.js`: Express uygulaması ve middleware ayarları.
- `src/server.js`: Sunucu başlatma ve DB bağlantısı.
- `src/config/db.js`: MongoDB bağlantı kodları.
- `src/controllers/`: İş mantığı (Business Logic).
- `src/models/`: Veritabanı şemaları (Mongoose).
- `src/routes/`: API uç noktaları (Endpoints).
- `src/middlewares/`: Yetkilendirme ve güvenlik kontrolleri.

## 5. API Kullanımı

### Kayıt Ol (Register)
- **URL**: `/api/auth/register`
- **Metod**: `POST`
- **Body**:
  ```json
  {
    "username": "kullanici1",
    "email": "test@ornek.com",
    "password": "guclu_sifre_123"
  }
  ```

### Giriş Yap (Login)
Başarılı giriş size iki adet token verir.
- **URL**: `/api/auth/login`
- **Metod**: `POST`
- **Body**:
  ```json
  {
    "email": "test@ornek.com",
    "password": "guclu_sifre_123"
  }
  ```
- **Yanıt**:
  ```json
  {
    "tokens": {
      "accessToken": "ey...",
      "refreshToken": "ey..."
    }
  }
  ```

### Token Yenileme (Refresh Token)
Access Token süresi dolduğunda (401 hatası aldığınızda) bu uç noktayı kullanarak yeni bir Access Token alabilirsiniz.
- **URL**: `/api/auth/refresh`
- **Metod**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "GIRIS_YAPARKEN_ALDIGINIZ_REFRESH_TOKEN"
  }
  ```

### Korumalı Rotalara Erişim
Access Token'ı `Authorization` başlığında (Header) göndermelisiniz.
- **Header**: `Authorization: Bearer <ACCESS_TOKEN>`

Örnek (Kullanıcı Profilini Çekme):
- **URL**: `/api/auth/me`
- **Metod**: `GET`

---

## 6. Geliştirici Kılavuzu (Yeni Endpoint Ekleme)

Bu proje "Statik RBAC" (Kod tabanlı yetkilendirme) ve "Swagger" (Otomatik dokümantasyon) kullanır. Yeni bir özellik eklerken aşağıdaki adımları izleyin.

### Adım 1: Controller Oluşturun
`src/controllers/` klasörüne gidip iş mantığını yazın.

```javascript
// src/controllers/book.controller.js
exports.listBooks = (req, res) => {
    res.json({ message: "Kitaplar listelendi" });
};

exports.deleteBook = (req, res) => {
    res.json({ message: "Kitap silindi" });
};
```

### Adım 2: Router Oluşturun ve Yetkilendirin
`src/routes/` klasöründe rotanızı tanımlayın.
- **Yetki İçin:** `authorize('admin')` middleware'ini kullanın.
- **Doküman İçin:** Metodun üzerine `@swagger` yorumu ekleyin.

```javascript
// src/routes/book.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/book.controller');
const authorize = require('../middlewares/role.middleware'); // <--- Yetki Middleware

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Kitapları listeler
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Başarılı
 */
// Herkes erişebilir (Public)
router.get('/', controller.listBooks);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Kitap siler (Sadece Admin)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Silindi
 *       403:
 *         description: Yetkisiz
 */
// SADECE ADMIN erişebilir (Protected)
router.delete('/:id', authorize('admin'), controller.deleteBook);

module.exports = router;
```

### Adım 3: App.js'e Kayıt Edin
Son olarak `src/app.js` dosyasına giderek rotanızı sisteme tanıtın.

```javascript
// src/app.js
app.use('/api/books', require('./routes/book.routes'));
```

### Adım 4: Test Edin
Tarayıcıdan `https://localhost:3000/api-docs` adresine gidin. Yeni eklediğiniz rotayı orada görmelisiniz.
