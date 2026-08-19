import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Unknown origins simply receive no CORS headers, so browsers block the response
        callback(null, !origin || ALLOWED_ORIGINS.includes(origin));
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is not set. Please set it in your .env file or environment.');
    process.exit(1);
}

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set. Please set it in your .env file or environment.');
    process.exit(1);
}

// Connect to MongoDB Atlas
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
mongoose.connect(MONGODB_URI, clientOptions)
    .then(() => console.log('✅ MongoDB Atlas Bağlantısı Başarılı!'))
    .catch(err => console.error('❌ MongoDB Bağlantı Hatası (Lütfen <db_password> yazan kısmı şifrenizle değiştirin):', err.message));

// --- SCHEMAS & MODELS ---
const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, default: 'editor' },
    status: { type: String, default: 'active' }
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: String,
    type: String,
    price: Number,
    originalPrice: Number,
    image: String,
    images: [String],
    specs: String,
    color: String,
    size: String,
    description: String,
    longDescription: String,
    isNew: Boolean,
    isSpecial: Boolean,
    stock: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', ProductSchema);

const SlideSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    image: String,
    title: String,
    subtitle: String,
    tag: String
});
const Slide = mongoose.model('Slide', SlideSchema);

const BlogSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    excerpt: String,
    content: String,
    image: String,
    date: String
});
const Blog = mongoose.model('Blog', BlogSchema);

const SettingsSchema = new mongoose.Schema({
    id: { type: String, unique: true, default: 'global' },
    siteName: String,
    email: String,
    phone: String,
    address: String,
    instagram: String,
    aboutHeroImage: String,
    aboutContentImage: String,
    aboutTitle: String,
    aboutText1: String,
    aboutText2: String,
    aboutYears: String,
    aboutCustomers: String
}, { strict: false });
const Settings = mongoose.model('Settings', SettingsSchema);

const OrderSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    customer: {
        fullName: String,
        email: String,
        phone: String,
        address: String
    },
    items: Array,
    subtotal: Number,
    total: Number,
    status: { type: String, default: 'pending' },
    date: String
}, { timestamps: true });
const Order = mongoose.model('Order', OrderSchema);

// --- MIDDLEWARES ---
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Erişim reddedildi' });
    try {
        const dec = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ id: dec.id });
        if (!user || user.status === 'blocked') {
            return res.status(403).json({ error: 'Hesabınız yöneticiler tarafından engellenmiştir.' });
        }
        req.user = { id: user.id, email: user.email, role: user.role, status: user.status };
        next();
    } catch (err) { res.status(401).json({ error: 'Geçersiz Token' }); }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
    next();
};

const isNonEmptyString = (value, maxLength = 500) =>
    typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Basic in-memory brute force protection for credential endpoints
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttempts = new Map();

const loginRateLimit = (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = loginAttempts.get(key);
    if (!entry || now - entry.start > LOGIN_WINDOW_MS) {
        loginAttempts.set(key, { start: now, count: 1 });
        return next();
    }
    entry.count += 1;
    if (entry.count > LOGIN_MAX_ATTEMPTS) {
        return res.status(429).json({ error: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.' });
    }
    next();
};

// --- EMAIL SERVICE ---
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (to, subject, text, html) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📬 E-posta gönderimi devre dışı (SMTP ayarları eksik). Gönderilecek içerik:', { to, subject });
        return;
    }
    try {
        await transporter.sendMail({
            from: `"Asil Kehribar" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`✅ E-posta gönderildi: ${to}`);
    } catch (err) {
        console.error('❌ E-posta gönderim hatası:', err.message);
    }
};

// --- AUTH API ---
app.post('/api/auth/login', loginRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!isNonEmptyString(email, 254) || !isNonEmptyString(password, 200)) {
            return res.status(400).json({ error: 'Geçersiz e-posta veya şifre' });
        }
        let user = await User.findOne({ email });

        // Initial admin creation is opt-in and only possible while the user collection is empty
        const usersCount = await User.countDocuments();
        if (usersCount === 0 && process.env.ALLOW_ADMIN_BOOTSTRAP === 'true') {
            if (process.env.BOOTSTRAP_ADMIN_EMAIL && process.env.BOOTSTRAP_ADMIN_EMAIL !== email) {
                return res.status(401).json({ error: 'Hatalı e-posta veya şifre' });
            }
            if (password.length < 12) {
                return res.status(400).json({ error: 'İlk yönetici şifresi en az 12 karakter olmalıdır.' });
            }
            const hash = await bcrypt.hash(password, 10);
            user = await User.create({ id: Date.now().toString(), email, password: hash, role: 'admin' });
            const token = jwt.sign({ id: user.id, email, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ token, user: { id: user.id, email, role: user.role } });
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre' });
        }
        if (user.status === 'blocked') {
            return res.status(403).json({ error: 'Hesabınız yöneticiler tarafından engellenmiştir.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!isNonEmptyString(email, 254) || !isNonEmptyString(password, 200) || password.length < 6) {
            return res.status(400).json({ error: 'Geçersiz e-posta veya şifre' });
        }
        if (role !== undefined && role !== 'admin' && role !== 'editor') {
            return res.status(400).json({ error: 'Geçersiz rol' });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ id: Date.now().toString(), email, password: hash, role: role || 'editor' });
        res.json({ id: user.id, email: user.email, role: user.role, status: user.status });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/updatePassword', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, password } = req.body;
        if (!isNonEmptyString(password, 200) || password.length < 6) {
            return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' });
        }
        if (!isNonEmptyString(currentPassword, 200)) {
            return res.status(400).json({ error: 'Mevcut şifrenizi girmelisiniz.' });
        }
        const user = await User.findOne({ id: req.user.id });
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Mevcut şifre hatalı' });
        }
        const hash = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate({ id: req.user.id }, { password: hash });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/auth/session', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ error: 'Bulunamadı' });
        res.json({ user: { id: user.id, email: user.email, role: user.role, status: user.status } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
    const users = await User.find({}, '-password');
    res.json(users);
});

app.post('/api/users/:id/block', authMiddleware, adminMiddleware, async (req, res) => {
    const { status } = req.body;
    if (status !== 'active' && status !== 'blocked') {
        return res.status(400).json({ error: 'Geçersiz durum' });
    }
    const user = await User.findOneAndUpdate({ id: req.params.id }, { status }, { new: true, projection: '-password' });
    res.json(user);
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await User.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- DATA API ---
const createCrudEndpoints = (model, baseRoute) => {
    app.get(baseRoute, async (req, res) => {
        try { res.json(await model.find({})); }
        catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post(baseRoute, authMiddleware, async (req, res) => {
        try {
            const { id, ...data } = req.body;
            if (!isNonEmptyString(id, 100)) return res.status(400).json({ error: 'Geçersiz id' });
            const doc = await model.findOneAndUpdate({ id }, { ...data, id }, { upsert: true, new: true });
            res.json(doc);
        } catch (err) { res.status(400).json({ error: err.message }); }
    });

    app.delete(`${baseRoute}/:id`, authMiddleware, async (req, res) => {
        try {
            await model.findOneAndDelete({ id: req.params.id });
            res.json({ success: true });
        } catch (err) { res.status(400).json({ error: err.message }); }
    });
};

// Public collector submissions: field-whitelisted, server-generated id, never overwrites existing products
const submissionAttempts = new Map();
const submitRateLimit = (req, res, next) => {
    const now = Date.now();
    const entry = submissionAttempts.get(req.ip);
    if (!entry || now - entry.start > 60 * 60 * 1000) {
        submissionAttempts.set(req.ip, { start: now, count: 1 });
        return next();
    }
    entry.count += 1;
    if (entry.count > 5) {
        return res.status(429).json({ error: 'Çok fazla gönderim yapıldı. Lütfen daha sonra tekrar deneyin.' });
    }
    next();
};

app.post('/api/products/submit', submitRateLimit, async (req, res) => {
    try {
        const { name, price, description, longDescription, specs, size, color, image, images } = req.body;
        if (!isNonEmptyString(name, 150) || !isNonEmptyString(description, 2000)) {
            return res.status(400).json({ error: 'Ürün adı ve açıklaması zorunludur' });
        }
        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice < 0 || numericPrice > 10_000_000) {
            return res.status(400).json({ error: 'Geçersiz fiyat' });
        }
        const imageList = Array.isArray(images) ? images.filter(i => typeof i === 'string').slice(0, 5) : [];
        if (imageList.some(i => i.length > 3_000_000) || (typeof image === 'string' && image.length > 3_000_000)) {
            return res.status(400).json({ error: 'Görsel boyutu çok büyük' });
        }

        const product = await Product.create({
            id: 'SUB-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            name,
            description,
            longDescription: typeof longDescription === 'string' ? longDescription.slice(0, 5000) : '',
            specs: typeof specs === 'string' ? specs.slice(0, 500) : '',
            size: typeof size === 'string' ? size.slice(0, 100) : '',
            color: typeof color === 'string' ? color.slice(0, 30) : '',
            image: typeof image === 'string' ? image : imageList[0] || '',
            images: imageList,
            price: numericPrice,
            type: 'Koleksiyoner Ürünü',
            stock: 0,
            isNew: false,
            isSpecial: false
        });
        res.json(product);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

createCrudEndpoints(Product, '/api/products');
createCrudEndpoints(Slide, '/api/slides');
createCrudEndpoints(Blog, '/api/blog');

app.get('/api/orders', authMiddleware, async (req, res) => {
    try { res.json(await Order.find({}).sort({ createdAt: -1 })); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items } = req.body;

        if (!customer || typeof customer !== 'object'
            || !isNonEmptyString(customer.fullName, 120)
            || !isNonEmptyString(customer.email, 254)
            || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)
            || !isNonEmptyString(customer.phone, 40)
            || !isNonEmptyString(customer.address, 1000)) {
            return res.status(400).json({ error: 'Geçersiz teslimat bilgileri' });
        }
        if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
            return res.status(400).json({ error: 'Geçersiz sepet' });
        }

        // Prices and totals are resolved from the database, never trusted from the client
        const resolvedItems = [];
        for (const item of items) {
            const quantity = Number(item?.quantity);
            if (!isNonEmptyString(item?.id, 100) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
                return res.status(400).json({ error: 'Geçersiz sepet ürünü' });
            }
            const product = await Product.findOne({ id: item.id });
            if (!product) return res.status(400).json({ error: 'Ürün bulunamadı' });
            if (typeof product.stock === 'number' && product.stock < quantity) {
                return res.status(400).json({ error: `Yetersiz stok: ${product.name}` });
            }
            resolvedItems.push({
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity
            });
        }

        const subtotal = resolvedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const orderId = 'ORD-' + Math.random().toString(36).slice(2, 11).toUpperCase();
        const order = await Order.create({
            id: orderId,
            customer: {
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address
            },
            items: resolvedItems,
            subtotal,
            total: subtotal,
            status: 'pending',
            date: new Date().toLocaleString('tr-TR')
        });

        // Decrease stock for each item
        for (const item of resolvedItems) {
            await Product.findOneAndUpdate(
                { id: item.id },
                { $inc: { stock: -item.quantity } }
            );
        }

        // Send confirmation email
        const orderSummary = resolvedItems
            .map(i => `${escapeHtml(i.name)} (${i.quantity} adet) - ₺${i.price}`)
            .join('\n');
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #b45309;">Siparişiniz Alındı!</h2>
                <p>Sayın ${escapeHtml(customer.fullName)},</p>
                <p><strong>${orderId}</strong> numaralı siparişiniz başarıyla sistemimize ulaşmıştır.</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Sipariş Özeti</h3>
                    <p style="white-space: pre-line;">${orderSummary}</p>
                    <hr>
                    <p><strong>Toplam: ₺${subtotal.toLocaleString('tr-TR')}</strong></p>
                </div>
                <p>Ürünleriniz en kısa sürede hazırlanıp kargoya verilecektir.</p>
                <p>Bizi tercih ettiğiniz için teşekkürler.</p>
            </div>
        `;

        await sendEmail(
            customer.email,
            'Siparişiniz Alındı - Asil Kehribar',
            `Siparişiniz için teşekkürler! Sipariş numaranız: ${orderId}`,
            emailHtml
        );

        res.json(order);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

const ORDER_STATUSES = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'];

app.post('/api/orders/:id/status', authMiddleware, async (req, res) => {
    try {
        if (!ORDER_STATUSES.includes(req.body.status)) {
            return res.status(400).json({ error: 'Geçersiz sipariş durumu' });
        }
        const order = await Order.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
        if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });

        // Notification for specific statuses
        if (req.body.status === 'shipped') {
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #059669;">Siparişiniz Kargoya Verildi!</h2>
                    <p>Sayın ${escapeHtml(order.customer.fullName)},</p>
                    <p><strong>${order.id}</strong> numaralı siparişiniz kargoya teslim edilmiştir.</p>
                    <p>Keyifli alışverişler dileriz.</p>
                </div>
            `;
            await sendEmail(order.customer.email, 'Siparişiniz Yolda! - Asil Kehribar', 'Siparişiniz kargoya verildi.', emailHtml);
        } else if (req.body.status === 'cancelled') {
            // Return stock if cancelled
            for (const item of order.items) {
                await Product.findOneAndUpdate(
                    { id: item.id },
                    { $inc: { stock: item.quantity } }
                );
            }
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #dc2626;">Siparişiniz İptal Edildi</h2>
                    <p>Sayın ${escapeHtml(order.customer.fullName)},</p>
                    <p><strong>${order.id}</strong> numaralı siparişiniz iptal edilmiştir.</p>
                </div>
            `;
            await sendEmail(order.customer.email, 'Sipariş İptali - Asil Kehribar', 'Siparişiniz iptal edildi.', emailHtml);
        }

        res.json(order);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Settings API is slightly different (singleton)
app.get('/api/settings', async (req, res) => {
    let s = await Settings.findOne({ id: 'global' });
    if (!s) {
        s = await Settings.create({
            id: 'global',
            email: 'iletisim@asilkehribar.com',
            phone: '+90 555 123 4567',
            aboutTitle: 'Gerçek Kehribar Zarafeti'
        });
    }
    res.json(s);
});

app.post('/api/settings', authMiddleware, async (req, res) => {
    try {
        const s = await Settings.findOneAndUpdate({ id: 'global' }, req.body, { upsert: true, new: true });
        res.json(s);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;

// Local'de doğrudan çalıştırıldığında sunucuyu başlat
// Vercel'de ise export default app kullanılır
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL === undefined) {
    app.listen(PORT, () => {
        console.log(`🚀 Asil Kehribar MongoDB Atlas API Sunucusu ${PORT} portunda çalışıyor.`);
    });
}

export default app;
