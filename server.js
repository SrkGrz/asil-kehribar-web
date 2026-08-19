import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 image uploads

const JWT_SECRET = process.env.JWT_SECRET || 'asil-kehribar-super-secret-key-2026';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set. Please set it in your .env file or environment.');
    process.exit(1);
}

// Connect to MongoDB Atlas
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
let isDatabaseReady = mongoose.connection.readyState === 1;
const databaseConnection = mongoose.connect(MONGODB_URI, clientOptions)
    .then(() => {
        isDatabaseReady = true;
        console.log('✅ MongoDB Atlas Bağlantısı Başarılı!');
        return true;
    })
    .catch(err => {
        isDatabaseReady = false;
        console.error('❌ MongoDB Bağlantı Hatası (Lütfen <db_password> yazan kısmı şifrenizle değiştirin):', err);
        return false;
    });

mongoose.connection.on('connected', () => {
    isDatabaseReady = true;
});
mongoose.connection.on('error', err => {
    isDatabaseReady = false;
    console.error('❌ MongoDB bağlantı olayı hatası:', err);
});
mongoose.connection.on('disconnected', () => {
    isDatabaseReady = false;
    console.error('❌ MongoDB bağlantısı kesildi.');
});

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
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Erişim reddedildi' });
    try {
        const dec = jwt.verify(token, JWT_SECRET);
        req.user = dec;
        next();
    } catch (err) { res.status(401).json({ error: 'Geçersiz Token' }); }
};

const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

const createHttpError = (status, message) => Object.assign(new Error(message), { status });

const databaseMiddleware = asyncHandler(async (req, res, next) => {
    if (isDatabaseReady && mongoose.connection.readyState === 1) {
        return next();
    }
    if (mongoose.connection.readyState === 2) {
        const connected = await databaseConnection;
        if (connected && mongoose.connection.readyState === 1) {
            return next();
        }
    }
    return res.status(503).json({ error: 'Veritabanı bağlantısı hazır değil. Lütfen daha sonra tekrar deneyin.' });
});

app.use('/api', databaseMiddleware);

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
        return false;
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
        console.error('❌ E-posta gönderim hatası:', err);
        return false;
    }
    return true;
};

// --- AUTH API ---
app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        throw createHttpError(400, 'E-posta ve şifre alanları zorunludur.');
    }
    let user = await User.findOne({ email });

    // Handle initial Admin creation automatically for MongoDB
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
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
}));

app.post('/api/auth/register', authMiddleware, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
    const { email, password, role } = req.body || {};
    if (!email || !password) {
        throw createHttpError(400, 'E-posta ve şifre alanları zorunludur.');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ id: Date.now().toString(), email, password: hash, role: role || 'editor' });
    res.json(user);
}));

app.post('/api/auth/updatePassword', authMiddleware, asyncHandler(async (req, res) => {
    const { password } = req.body || {};
    if (!password) {
        throw createHttpError(400, 'Yeni şifre alanı zorunludur.');
    }
    const hash = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ id: req.user.id }, { password: hash });
    res.json({ success: true });
}));

app.get('/api/auth/session', authMiddleware, asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'Bulunamadı' });
    res.json({ user: { id: user.id, email: user.email, role: user.role, status: user.status } });
}));

app.get('/api/users', authMiddleware, asyncHandler(async (req, res) => {
    const users = await User.find({}, '-password');
    res.json(users);
}));

app.post('/api/users/:id/block', authMiddleware, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
    const user = await User.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(user);
}));

app.delete('/api/users/:id', authMiddleware, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json({ success: true });
}));

// --- DATA API ---
const createCrudEndpoints = (model, baseRoute) => {
    app.get(baseRoute, asyncHandler(async (req, res) => {
        res.json(await model.find({}));
    }));

    app.post(baseRoute, asyncHandler(async (req, res) => {
        const { id, ...data } = req.body;
        const doc = await model.findOneAndUpdate({ id }, { ...data, id }, { upsert: true, new: true });
        res.json(doc);
    }));

    app.delete(`${baseRoute}/:id`, authMiddleware, asyncHandler(async (req, res) => {
        const doc = await model.findOneAndDelete({ id: req.params.id });
        if (!doc) return res.status(404).json({ error: 'Kayıt bulunamadı' });
        res.json({ success: true });
    }));
};

createCrudEndpoints(Product, '/api/products');
createCrudEndpoints(Slide, '/api/slides');
createCrudEndpoints(Blog, '/api/blog');

app.get('/api/orders', authMiddleware, asyncHandler(async (req, res) => {
    res.json(await Order.find({}).sort({ createdAt: -1 }));
}));

app.post('/api/orders', asyncHandler(async (req, res) => {
    const { items, customer, total } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
        throw createHttpError(400, 'Sipariş kalemleri zorunludur.');
    }
    if (items.some(item => !item || !item.id || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
        throw createHttpError(400, 'Sipariş kalemleri geçerli ürün ve miktar bilgisi içermelidir.');
    }
    if (!customer || !customer.fullName || !customer.email) {
        throw createHttpError(400, 'Müşteri adı ve e-posta bilgileri zorunludur.');
    }
    if (!Number.isFinite(total)) {
        throw createHttpError(400, 'Sipariş toplamı geçerli bir sayı olmalıdır.');
    }

    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const order = await Order.create({ ...req.body, status: 'pending', id: orderId });
    const warnings = [];

    try {
        for (const item of items) {
            await Product.findOneAndUpdate(
                { id: item.id },
                { $inc: { stock: -item.quantity } }
            );
        }
    } catch (err) {
        console.error(`❌ ${orderId} stok güncelleme hatası:`, err);
        warnings.push('Stok bilgileri güncellenemedi.');
    }

    const orderSummary = items.map(i => `${i.name} (${i.quantity} adet) - ₺${i.price}`).join('\n');
    const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #b45309;">Siparişiniz Alındı!</h2>
            <p>Sayın ${customer.fullName},</p>
            <p><strong>${orderId}</strong> numaralı siparişiniz başarıyla sistemimize ulaşmıştır.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Sipariş Özeti</h3>
                <p style="white-space: pre-line;">${orderSummary}</p>
                <hr>
                <p><strong>Toplam: ₺${total.toLocaleString('tr-TR')}</strong></p>
            </div>
            <p>Ürünleriniz en kısa sürede hazırlanıp kargoya verilecektir.</p>
            <p>Bizi tercih ettiğiniz için teşekkürler.</p>
        </div>
    `;

    if (!await sendEmail(
        customer.email,
        'Siparişiniz Alındı - Asil Kehribar',
        `Siparişiniz için teşekkürler! Sipariş numaranız: ${orderId}`,
        emailHtml
    )) {
        warnings.push('Onay e-postası gönderilemedi.');
    }

    res.json({ ...order.toObject(), ...(warnings.length > 0 ? { warning: warnings.join(' ') } : {}) });
}));

app.post('/api/orders/:id/status', authMiddleware, asyncHandler(async (req, res) => {
    const order = await Order.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });
    const warnings = [];

    // Notification for specific statuses
    if (req.body.status === 'shipped') {
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #059669;">Siparişiniz Kargoya Verildi!</h2>
                <p>Sayın ${order.customer.fullName},</p>
                <p><strong>${order.id}</strong> numaralı siparişiniz kargoya teslim edilmiştir.</p>
                <p>Keyifli alışverişler dileriz.</p>
            </div>
        `;
        if (!await sendEmail(order.customer.email, 'Siparişiniz Yolda! - Asil Kehribar', 'Siparişiniz kargoya verildi.', emailHtml)) {
            warnings.push('Kargo bildirim e-postası gönderilemedi.');
        }
    } else if (req.body.status === 'cancelled') {
        try {
            for (const item of order.items) {
                await Product.findOneAndUpdate(
                    { id: item.id },
                    { $inc: { stock: item.quantity } }
                );
            }
        } catch (err) {
            console.error(`❌ ${order.id} iptal stok iade hatası:`, err);
            warnings.push('Stok iadesi gerçekleştirilemedi.');
        }
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #dc2626;">Siparişiniz İptal Edildi</h2>
                <p>Sayın ${order.customer.fullName},</p>
                <p><strong>${order.id}</strong> numaralı siparişiniz iptal edilmiştir.</p>
            </div>
        `;
        if (!await sendEmail(order.customer.email, 'Sipariş İptali - Asil Kehribar', 'Siparişiniz iptal edildi.', emailHtml)) {
            warnings.push('İptal bildirim e-postası gönderilemedi.');
        }
    }

    res.json({ ...order.toObject(), ...(warnings.length > 0 ? { warning: warnings.join(' ') } : {}) });
}));

// Settings API is slightly different (singleton)
app.get('/api/settings', asyncHandler(async (req, res) => {
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
}));

app.post('/api/settings', authMiddleware, asyncHandler(async (req, res) => {
    const s = await Settings.findOneAndUpdate({ id: 'global' }, req.body, { upsert: true, new: true });
    res.json(s);
}));

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpointi bulunamadı' });
});

app.use((err, req, res, next) => {
    const status = err.status || err.statusCode ||
        (err.name === 'ValidationError' || err.name === 'CastError' || err.code === 11000 ? 400 : 500);
    console.error('❌ İstek işleme hatası:', err);
    if (res.headersSent) return next(err);
    res.status(status).json({
        error: status >= 500 ? 'Beklenmeyen bir sunucu hatası oluştu.' : err.message
    });
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ İşlenmeyen Promise reddi:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Yakalanmamış istisna:', err);
    process.exit(1);
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
