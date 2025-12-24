const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const certsDir = path.join(__dirname, '..', 'certs');

if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

fs.writeFileSync(path.join(certsDir, 'cert.pem'), pems.cert);
fs.writeFileSync(path.join(certsDir, 'key.pem'), pems.private);

console.log('SSL sertifikaları başarıyla oluşturuldu:');
console.log(path.join(certsDir, 'cert.pem'));
console.log(path.join(certsDir, 'key.pem'));
