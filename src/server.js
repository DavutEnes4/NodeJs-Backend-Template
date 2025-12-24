require('dotenv').config(); // En üstte olmalı
const app = require('./app');
const https = require('https');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

// Veritabanına Bağlan
// Veritabanı Bağlantısı ve Sunucu Başlatma
const startServer = async () => {
    await connectDB();

    server.listen(PORT, async () => {
        console.log(`Güvenli Sunucu (HTTPS) ${PORT} portunda çalışıyor.`);
        console.log(`Test için: https://localhost:${PORT}/api/saglik`);


    });
};

startServer();

const PORT = process.env.PORT || 3000;

// SSL Sertifikalarını Oku
const sslKeyPath = path.join(__dirname, '../', process.env.SSL_KEY_PATH || 'certs/key.pem');
const sslCertPath = path.join(__dirname, '../', process.env.SSL_CERT_PATH || 'certs/cert.pem');

const sslOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
};

// HTTPS Sunucusunu Başlat
const server = https.createServer(sslOptions, app);


