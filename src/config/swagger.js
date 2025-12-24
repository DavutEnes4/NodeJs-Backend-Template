const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Deneyap API',
            version: '1.0.0',
            description: 'Deneyap Express API Projesi için otomatik oluşturulan API dokümantasyonu.',
            contact: {
                name: 'API Destek',
                email: 'destek@deneyap.gov.tr'
            }
        },
        servers: [
            {
                url: 'https://localhost:3000/api',
                description: 'Geliştirme Sunucusu (HTTPS)'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // API rotalarımızın nerede olduğunu belirtiyoruz
    apis: ['./src/routes/*.js', './src/app.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
