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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Vercel-Admin-atlas-lime-anchor:L6LMwINSZl1UisUB@atlas-lime-anchor.kykuquw.mongodb.net/asil-kehribar?retryWrites=true&w=majority";

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
    specs: String,
    color: String,
    size: String,
    description: String,
    longDescription: String,
    isNew: Boolean,
    isSpecial: Boolean
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

// --- AUTH API ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });

        // Handle initial Admin creation automatically for MongoDB
        const usersCount = await User.countDocuments();
        if (usersCount === 0) {
            const hash = await bcrypt.hash(password, 10);
            user = await User.create({ id: Date.now().toString(), email, password: hash, role: 'admin' });
            const token = jwt.sign({ id: user.id, email, role: user.role, status: user.status }, JWT_SECRET);
            return res.json({ token, user: { id: user.id, email, role: user.role } });
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre' });
        }
        if (user.status === 'blocked') {
            return res.status(403).json({ error: 'Hesabınız yöneticiler tarafından engellenmiştir.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
        const { email, password, role } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ id: Date.now().toString(), email, password: hash, role: role || 'editor' });
        res.json(user);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/updatePassword', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;
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

app.get('/api/users', authMiddleware, async (req, res) => {
    const users = await User.find({}, '-password');
    res.json(users);
});

app.post('/api/users/:id/block', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
    const user = await User.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    res.json(user);
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Yetkisiz' });
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

    app.post(baseRoute, async (req, res) => {
        try {
            const { id, ...data } = req.body;
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

createCrudEndpoints(Product, '/api/products');
createCrudEndpoints(Slide, '/api/slides');
createCrudEndpoints(Blog, '/api/blog');

app.get('/api/orders', authMiddleware, async (req, res) => {
    try { res.json(await Order.find({}).sort({ createdAt: -1 })); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = await Order.create({ ...req.body, status: 'pending', id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase() });
        res.json(order);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/orders/:id/status', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
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
