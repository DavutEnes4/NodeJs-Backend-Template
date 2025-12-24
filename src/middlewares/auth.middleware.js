const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            durum: 'hata',
            mesaj: 'Oturum açmanız gerekiyor (Token bulunamadı)'
        });
    }

    try {
        // Sadece Access Token kontrol edilir
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

        // Mongoose findById
        // -password diyerek şifre alanını getirmemeyi sağlarız (güvenlik)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                durum: 'hata',
                mesaj: 'Yetkisiz kullanıcı'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        // Token süresi dolmuşsa buraya düşer
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                durum: 'hata',
                hataKodu: 'TOKEN_EXPIRED',
                mesaj: 'Oturum süresi doldu. Lütfen yenileyin.'
            });
        }

        return res.status(401).json({
            durum: 'hata',
            mesaj: 'Geçersiz token'
        });
    }
};

module.exports = authMiddleware;
