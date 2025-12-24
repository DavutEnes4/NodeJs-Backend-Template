const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// .env dosyasından anahtarları al
// Not: Controller yüklendiğinde .env yüklü olmalı (server.js'de en üstte)
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Token Yardımcı Fonksiyonları (Runtime'da çalışır, yani env o an yüklü olur)
// Ancak const tanımları yukarıda yapıldığı için modül yüklenirken env hazır olmalı.
// Alternatif: Secret'ları fonksiyon içinde alabiliriz ama pratik değil.

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ durum: 'hata', mesaj: 'Tüm alanları doldurun' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ durum: 'hata', mesaj: 'Bu email zaten kayıtlı' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            roles: roles || ['user']
        });

        res.status(201).json({
            durum: 'basarili',
            mesaj: 'Kullanıcı oluşturuldu',
            kullanici: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                roles: newUser.roles
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ durum: 'hata', mesaj: 'Sunucu hatası' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ durum: 'hata', mesaj: 'Email ve şifre gerekli' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ durum: 'hata', mesaj: 'Geçersiz bilgiler' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ durum: 'hata', mesaj: 'Geçersiz bilgiler' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        if (!user.refreshTokens) user.refreshTokens = [];
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).json({
            durum: 'basarili',
            mesaj: 'Giriş başarılı',
            tokens: {
                accessToken,
                refreshToken
            },
            kullanici: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ durum: 'hata', mesaj: 'Sunucu hatası' });
    }
};

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ durum: 'hata', mesaj: 'Refresh Token gerekli' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ durum: 'hata', mesaj: 'Kullanıcı bulunamadı' });
        }

        if (!user.refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ durum: 'hata', mesaj: 'Geçersiz Refresh Token' });
        }

        const newAccessToken = generateAccessToken(user._id);

        res.json({
            durum: 'basarili',
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error(error);
        return res.status(403).json({ durum: 'hata', mesaj: 'Geçersiz veya süresi dolmuş Refresh Token' });
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(200).json({ durum: 'basarili', mesaj: 'Çıkış yapıldı (Token yoktu)' });
    }

    try {
        const decoded = jwt.decode(refreshToken);
        if (decoded && decoded.id) {
            const user = await User.findById(decoded.id);
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
                await user.save();
            }
        }

        res.status(200).json({ durum: 'basarili', mesaj: 'Başarıyla çıkış yapıldı' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ durum: 'hata', mesaj: 'Sunucu hatası' });
    }
};

exports.getMe = async (req, res) => {
    try {
        res.status(200).json({
            durum: 'basarili',
            kullanici: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ durum: 'hata', mesaj: 'Sunucu hatası' });
    }
};
