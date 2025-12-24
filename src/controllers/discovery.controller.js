// exports.discover = async (req, res) => {
//     // Statik Rota Listesi (Veritabanı yerine buradan okuyoruz artık)
//     const definedEndpoints = [
//         { method: 'GET', path: '/api/discovery', roles: ['user', 'admin'], description: 'API keşif rotası' },
//         { method: 'GET', path: '/api/saglik', roles: [], description: 'Sağlık kontrolü' },
//         { method: 'POST', path: '/api/auth/register', roles: [], description: 'Kayıt ol' },
//         { method: 'POST', path: '/api/auth/login', roles: [], description: 'Giriş yap' },
//         { method: 'POST', path: '/api/auth/refresh', roles: [], description: 'Token yenile' },
//         { method: 'POST', path: '/api/auth/logout', roles: [], description: 'Çıkış yap' },
//         { method: 'GET', path: '/api/auth/me', roles: ['user', 'admin'], description: 'Profil bilgisi' }
//     ];

//     try {
//         const userRoles = req.user ? (req.user.roles || []) : [];

//         // Filtrele
//         const allowedEndpoints = definedEndpoints.filter(endpoint => {
//             // Public (Rol listesi boşsa)
//             if (endpoint.roles.length === 0) return true;
//             // Yetkili
//             return userRoles.some(role => endpoint.roles.includes(role));
//         });

//         res.json({
//             durum: 'basarili',
//             mesaj: `Rollerinize (${userRoles.length > 0 ? userRoles.join(', ') : 'Misafir'}) uygun komutlar listelendi.`,
//             komutlar: allowedEndpoints
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ durum: 'hata', mesaj: 'Discovery hatası' });
//     }
// };

// Basitleştirilmiş versiyon (Kullanıcı kafa karışıklığını önlemek için)
exports.discover = (req, res) => {
    const userRoles = req.user ? (req.user.roles || []) : ['misafir'];

    res.json({
        durum: 'basarili',
        mesaj: `Hoşgeldiniz. Mevcut rolleriniz: ${userRoles.join(', ')}`,
        not: "Statik RBAC sistemine geçildiği için otomatik rota listeleme devre dışı bırakılmıştır. Swagger UI (/api-docs) kullanarak tüm API'yi inceleyebilirsiniz."
    });
};
