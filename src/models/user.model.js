const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı zorunludur'],
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, 'Email adresi zorunludur'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Lütfen geçerli bir email adresi giriniz'
        ]
    },
    password: {
        type: String,
        required: [true, 'Şifre zorunludur'],
        minlength: 6
    },
    // Rolleri dizi olarak saklıyoruz (Multi-role)
    roles: {
        type: [String],
        default: [process.env.DEFAULT_USER_ROLE || 'user'],
        enum: ['user', 'admin'] // İzin verilen roller
    },
    // Refresh Token'ları bu dizide saklayacağız
    refreshTokens: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Kaydedilmeden önce bir işlem yapmak isterseniz buraya 'pre' hook ekleyebilirsiniz.
// Ancak biz controller'da hash'leme yapıyoruz, o yüzden şimdilik boş bırakabiliriz.

module.exports = mongoose.model('User', userSchema);
