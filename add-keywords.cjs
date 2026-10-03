const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update title
html = html.replace(/<title>.*?<\/title>/, '<title>PenguinPay Official | PenguinPay Login, App & APK Download</title>');

// 2. Update meta keywords
const newKeywords = 'PenguinPay, PenguinPay login, Penguin Pay, PenguinPay official, PenguinPay USDT, PenguinPay APK, PenguinPay app, PenguinPay APK download, PenguinPay app download, PenguinPay official website, PenguinPay custom support, PenguinPay real or fake, PenguinPay real ya fake, PenguinPay USDT to INR, पेंगुइन पे, पेंगुइन पे लॉगिन, पेंगुइन पे ऐप, पेंगुइन पे डाउनलोड, पेंगुइन पे कस्टमर सपोर्ट, penguinpay, penguinpay login, penguin pay, penguinpay apk download, penguinpay app, penguinpay apk, penguinpay official website, penguinpay custom support';
html = html.replace(/<meta name="keywords" content="[^"]*"/, `<meta name="keywords" content="${newKeywords}"`);

// 3. Update meta description
const newDesc = 'Welcome to PenguinPay Official. Secure PenguinPay login, fast USDT transactions, and PenguinPay app download. Get the latest PenguinPay APK download for seamless Penguin Pay access.';
html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${newDesc}"`);
html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${newDesc}"`);
html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${newDesc}"`);

// 4. Update og:title and twitter:title
html = html.replace(/<meta property="og:title" content="[^"]*"/, '<meta property="og:title" content="PenguinPay Official | PenguinPay Login & App Download"');
html = html.replace(/<meta name="twitter:title" content="[^"]*"/, '<meta name="twitter:title" content="PenguinPay Official | PenguinPay Login & App Download"');

fs.writeFileSync('index.html', html);
console.log('PenguinPay keywords updated successfully!');
