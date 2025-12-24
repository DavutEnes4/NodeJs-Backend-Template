const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Rota dosyalarını içe aktar
// Import route files
const authRoutes = require('./routes/auth.routes');

const app = express();

// --- Middleware'ler ---

// Güvenlik başlıkları (Helmet)
// Security headers
app.use(helmet());

// CORS ayarları
// CORS configuration
app.use(cors());

// JSON verilerini body'den okuyabilmek için
// Parse JSON request body
app.use(express.json());

// URL-encoded verileri okuyabilmek için
// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// --- Rate Limiting (Hız Sınırlama) ---
const rateLimit = require('express-rate-limit');
if (process.env.RATE_LIMIT_ENABLED === 'true') {
    // Reverse Proxy (Nginx, Cloudflare vb.) arkasında çalışıyorsa güven
    app.set('trust proxy', 1);

    const limiter = rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        message: { durum: 'hata', mesaj: 'Çok fazla istek gönderdiniz, lütfen biraz bekleyin.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Tüm API rotalarına uygula
    app.use('/api', limiter);
    console.log(`🛡️  Rate Limiting AKTİF (Limit: ${process.env.RATE_LIMIT_MAX}, Pencere: ${process.env.RATE_LIMIT_WINDOW_MS}ms)`);
}


// --- Rotalar (Routes) ---

// Sağlık kontrolü (Health Check)
/**
 * @swagger
 * /saglik:
 *   get:
 *     summary: Sunucu sağlık durumu
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Sunucu çalışıyor
 */
app.get('/api/saglik', (req, res) => {
    res.status(200).json({
        durum: 'basarili',
        mesaj: 'API çalışıyor',
        zaman: new Date().toISOString()
    });
});

// Örnek Rotalar
// Example Routes
// Auth Rotaları
app.use('/api/auth', authRoutes);

// Keşif Rotası (Yetkiye göre komutları listeler)
app.use('/api/discovery', require('./routes/discovery.routes'));

// --- Swagger Dokümantasyon ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log('📄 Swagger Dokümantasyonu: https://localhost:3000/api-docs');


// --- Hata Yönetimi (Error Handling) ---

// 404 - Bulunamadı
// 404 - Not Found
app.use((req, res, next) => {
    res.status(404).json({
        durum: 'hata',
        mesaj: 'Kaynak bulunamadı'
    });
});

// Genel Hata Yakalayıcı
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        durum: 'hata',
        mesaj: 'Sunucu içi hata oluştu',
        detay: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
