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
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Erişim reddedildi' });
    try {
        const dec = jwt.verify(token, JWT_SECRET);
        req.user = dec;
        next();
    } catch (err) { res.status(401).json({ error: 'Geçersiz Token' }); }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
    next();
};

/** Wraps an async route handler so rejections turn into a JSON error response. */
const handle = (fn, errorStatus = 400) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (err) {
        res.status(errorStatus).json({ error: err.message });
    }
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

const emailLayout = (headingColor, heading, bodyHtml) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: ${headingColor};">${heading}</h2>
        ${bodyHtml}
    </div>
`;

// --- AUTH API ---
app.post('/api/auth/login', handle(async (req, res) => {
    const { email, password } = req.body;
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
}, 500));

app.post('/api/auth/register', authMiddleware, requireAdmin, handle(async (req, res) => {
    const { email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ id: Date.now().toString(), email, password: hash, role: role || 'editor' });
    res.json(user);
}));

app.post('/api/auth/updatePassword', authMiddleware, handle(async (req, res) => {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ id: req.user.id }, { password: hash });
    res.json({ success: true });
}));

app.get('/api/auth/session', authMiddleware, handle(async (req, res) => {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'Bulunamadı' });
    res.json({ user: { id: user.id, email: user.email, role: user.role, status: user.status } });
}, 500));

app.get('/api/users', authMiddleware, async (req, res) => {
    const users = await User.find({}, '-password');
    res.json(users);
});

app.post('/api/users/:id/block', authMiddleware, requireAdmin, async (req, res) => {
    const user = await User.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    res.json(user);
});

app.delete('/api/users/:id', authMiddleware, requireAdmin, handle(async (req, res) => {
    await User.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
}));

// --- DATA API ---
const createCrudEndpoints = (model, baseRoute) => {
    app.get(baseRoute, handle(async (req, res) => {
        res.json(await model.find({}));
    }, 500));

    app.post(baseRoute, handle(async (req, res) => {
        const { id, ...data } = req.body;
        const doc = await model.findOneAndUpdate({ id }, { ...data, id }, { upsert: true, new: true });
        res.json(doc);
    }));

    app.delete(`${baseRoute}/:id`, authMiddleware, handle(async (req, res) => {
        await model.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    }));
};

createCrudEndpoints(Product, '/api/products');
createCrudEndpoints(Slide, '/api/slides');
createCrudEndpoints(Blog, '/api/blog');

app.get('/api/orders', authMiddleware, handle(async (req, res) => {
    res.json(await Order.find({}).sort({ createdAt: -1 }));
}, 500));

app.post('/api/orders', handle(async (req, res) => {
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const order = await Order.create({ ...req.body, status: 'pending', id: orderId });

    // Decrease stock for each item
    for (const item of req.body.items) {
        await Product.findOneAndUpdate(
            { id: item.id },
            { $inc: { stock: -item.quantity } }
        );
    }

    // Send confirmation email
    const orderSummary = req.body.items.map(i => `${i.name} (${i.quantity} adet) - ₺${i.price}`).join('\n');
    const emailHtml = emailLayout('#b45309', 'Siparişiniz Alındı!', `
        <p>Sayın ${req.body.customer.fullName},</p>
        <p><strong>${orderId}</strong> numaralı siparişiniz başarıyla sistemimize ulaşmıştır.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Sipariş Özeti</h3>
            <p style="white-space: pre-line;">${orderSummary}</p>
            <hr>
            <p><strong>Toplam: ₺${req.body.total.toLocaleString('tr-TR')}</strong></p>
        </div>
        <p>Ürünleriniz en kısa sürede hazırlanıp kargoya verilecektir.</p>
        <p>Bizi tercih ettiğiniz için teşekkürler.</p>
    `);

    await sendEmail(
        req.body.customer.email,
        'Siparişiniz Alındı - Asil Kehribar',
        `Siparişiniz için teşekkürler! Sipariş numaranız: ${orderId}`,
        emailHtml
    );

    res.json(order);
}));

app.post('/api/orders/:id/status', authMiddleware, handle(async (req, res) => {
    const order = await Order.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });

    // Notification for specific statuses
    if (req.body.status === 'shipped') {
        const emailHtml = emailLayout('#059669', 'Siparişiniz Kargoya Verildi!', `
            <p>Sayın ${order.customer.fullName},</p>
            <p><strong>${order.id}</strong> numaralı siparişiniz kargoya teslim edilmiştir.</p>
            <p>Keyifli alışverişler dileriz.</p>
        `);
        await sendEmail(order.customer.email, 'Siparişiniz Yolda! - Asil Kehribar', 'Siparişiniz kargoya verildi.', emailHtml);
    } else if (req.body.status === 'cancelled') {
        // Return stock if cancelled
        for (const item of order.items) {
            await Product.findOneAndUpdate(
                { id: item.id },
                { $inc: { stock: item.quantity } }
            );
        }
        const emailHtml = emailLayout('#dc2626', 'Siparişiniz İptal Edildi', `
            <p>Sayın ${order.customer.fullName},</p>
            <p><strong>${order.id}</strong> numaralı siparişiniz iptal edilmiştir.</p>
        `);
        await sendEmail(order.customer.email, 'Sipariş İptali - Asil Kehribar', 'Siparişiniz iptal edildi.', emailHtml);
    }

    res.json(order);
}));

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

app.post('/api/settings', authMiddleware, handle(async (req, res) => {
    const s = await Settings.findOneAndUpdate({ id: 'global' }, req.body, { upsert: true, new: true });
    res.json(s);
}));

const PORT = process.env.PORT || 5000;

// Local'de doğrudan çalıştırıldığında sunucuyu başlat
// Vercel'de ise export default app kullanılır
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL === undefined) {
    app.listen(PORT, () => {
        console.log(`🚀 Asil Kehribar MongoDB Atlas API Sunucusu ${PORT} portunda çalışıyor.`);
    });
}

export default app;
