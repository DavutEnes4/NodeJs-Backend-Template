/**
 * Role Based Access Control (RBAC) Middleware
 * Bu middleware, kullanıcının belirli rollere sahip olup olmadığını kontrol eder.
 * 
 * Kullanım: router.get('/admin-panel', authorize('admin'), controller.method);
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. Kullanıcı giriş yapmış mı? (req.user authMiddleware'den gelir)
        if (!req.user) {
            return res.status(401).json({
                durum: 'hata',
                mesaj: 'Bu işlem için giriş yapmalısınız.'
            });
        }

        // 2. Kullanıcının rolleri var mı?
        const userRoles = req.user.roles || [];

        // 3. İzin verilen rollerden en az birine sahip mi?
        // Admin her yere girebilir (Opsiyonel: İsterseniz bunu kaldırabilirsiniz)
        if (userRoles.includes('admin')) {
            return next();
        }

        // Eğer izin verilen roller boşsa (boş parantez), belki sadece giriş yapması yeterlidir?
        // Ama genelde authorize() kullanıyorsak rol bekleriz.
        if (allowedRoles.length === 0) {
            return next();
        }

        const hasRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                durum: 'hata',
                mesaj: 'Bu işlem için yetkiniz yok.',
                gerekenRoller: allowedRoles
            });
        }

        next();
    };
};

module.exports = authorize;
