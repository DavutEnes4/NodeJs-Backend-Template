const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discovery.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Keşif rotası (Opsiyonel Auth)
// Eğer kişi giriş yapmışsa yetkilerini görüp ona göre liste döner.
// Giriş yapmamışsa sadece public olanları döner.
// Bu yüzden authMiddleware'i "soft" olarak kullanacağız veya controller içinde yöneteceğiz.
// Ancak mevcut authMiddleware "Strict" (Token yoksa 401 veriyor).
// Bu yüzden buraya özel bir middleware yazabiliriz veya authMiddleware'i modifiye edebiliriz.
// Pratik çözüm: authMiddleware token bulamazsa hata vermesin, devam etsin.

// Custom "Soft" Auth Middleware for Discovery
const softAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // Token var, normal authMiddleware gibi davran (ama hata verirse yutma, next'e hata iletme - sadece user yok de)
        // Burada mevcut authMiddleware'i çağırmak yerine basitçe decode edip user'ı bulmayı deneyebiliriz.
        // Ama kod tekrarı olmaması için authMiddleware'i kullanmak en doğrusu ama o hata fırlatıyor.

        // Hızlı çözüm: Controller içinde `req.user` undefined ise anonymous sayarız.
        // Client token gönderdiyse zaten app seviyesinde veya route seviyesinde authMiddleware çalışır.
        // Ama biz BURADA token olmasa da geçiş izni vermek istiyoruz.

        // Bu yüzden burada AuthMiddleware KULLANMIYORUZ.
        // Ancak token varsa parse etmek istiyoruz.
        // Aşağıdaki kod basic bir token parser:
        const jwt = require('jsonwebtoken');
        const User = require('../models/user.model');
        const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
            User.findById(decoded.id).select('-password').then(user => {
                req.user = user;
                next();
            }).catch(() => next());
        } catch (err) {
            next(); // Token geçersizse de devam et (Anonymous olarak)
        }
    } else {
        next(); // Token yok, devam et
    }
};

/**
 * @swagger
 * /discovery:
 *   get:
 *     summary: API keşif rotası (Statik Roller)
 *     tags: [Discovery]
 *     responses:
 *       200:
 *         description: Kullanıcının rollerini ve statik bilgilendirme mesajını döner.
 */
router.get('/', softAuthMiddleware, discoveryController.discover);

module.exports = router;
