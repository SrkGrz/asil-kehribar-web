
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Blog } from './pages/Blog';
import { Admin } from './pages/Admin';
import { Favorites } from './pages/Favorites';
import { Returns } from './pages/Returns';
import { Certificates } from './pages/Certificates';
import { ProductDetail } from './pages/ProductDetail';
import { CartItem, Product, Slide, SiteSettings, BlogPost } from './types';
import { MOCK_PRODUCTS, DEFAULT_SLIDES, DEFAULT_SETTINGS, DEFAULT_BLOG_POSTS } from './constants';

const Navbar = ({ cartCount, favCount }: { cartCount: number, favCount: number }) => {
  const [isDark, setIsDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="size-12 rounded-2xl bg-stone-950 dark:bg-primary flex items-center justify-center shadow-xl shadow-primary/20 transition-all duration-500">
                  <span className="material-symbols-outlined text-primary dark:text-stone-950 text-3xl font-light">hexagon</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-display font-black text-stone-950 dark:text-white leading-none tracking-tight flex items-center gap-1">
                  Asil <span className="text-primary italic font-medium">Kehribar</span>
                </h1>
                <p className="text-[9px] tracking-[0.5em] uppercase font-bold text-stone-400 mt-1">Fine Amber Collection</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-10">
              <Link to="/shop" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Koleksiyon</Link>
              <Link to="/about" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Hakkımızda</Link>
              <Link to="/contact" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">İletişim</Link>
              <Link to="/blog" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Blog</Link>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 sm:w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl py-2 pl-4 pr-10 text-xs font-bold focus:ring-1 focus:ring-primary"
                  autoFocus={isSearchOpen}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
              </form>
            </div>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-300 flex items-center justify-center ${isSearchOpen ? 'text-primary' : ''}`}
              title="Arama"
            >
              <span className="material-symbols-outlined text-[20px]">{isSearchOpen ? 'close' : 'search'}</span>
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-300 flex items-center justify-center"
              title={isDark ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <Link
              to="/favorites"
              className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-300 relative flex items-center justify-center"
              title="Favorilerim"
            >
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              {favCount > 0 && (
                <span className="absolute top-2 right-2 bg-primary text-stone-950 text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {favCount}
                </span>
              )}
            </Link>
            <Link
              to="/checkout"
              className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-300 relative flex items-center justify-center"
              title="Sepet"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 bg-stone-950 dark:bg-white text-white dark:text-stone-950 text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const TrustBanner = () => (
  <section className="border-t border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-stone-950">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center md:justify-start gap-3 group">
          <div className="size-10 rounded-xl bg-zinc-50 dark:bg-stone-950 flex items-center justify-center text-primary border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary group-hover:text-stone-950 transition-all duration-500">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-0.5">256-Bit SSL</h4>
            <p className="text-[9px] text-stone-500 font-bold uppercase tracking-tight">Güvenli Veri İletişimi</p>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-3 group">
          <div className="size-10 rounded-xl bg-zinc-50 dark:bg-stone-950 flex items-center justify-center text-primary border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary group-hover:text-stone-950 transition-all duration-500">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-0.5">3D Secure</h4>
            <p className="text-[9px] text-stone-500 font-bold uppercase tracking-tight">Onaylı Ödeme Sistemi</p>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-3 group">
          <div className="size-10 rounded-xl bg-zinc-50 dark:bg-stone-950 flex items-center justify-center text-primary border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary group-hover:text-stone-950 transition-all duration-500">
            <span className="material-symbols-outlined text-xl">encrypted</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-0.5">KVKK Uyumlu</h4>
            <p className="text-[9px] text-stone-500 font-bold uppercase tracking-tight">Veri Gizliliği Garantisi</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-zinc-50 dark:bg-stone-950/50 border-t border-zinc-200 dark:border-zinc-800">
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-2">
          <h3 className="font-display text-3xl font-black mb-6 text-stone-950 dark:text-white">Asil Kehribar</h3>
          <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">Nadir eserler, usta işçilik ve milyonlarca yıllık hikayeler. Asil bir duruş için tasarlanmış seçkin kehribar koleksiyonu.</p>
          <div className="flex gap-4">
            <a href="https://instagram.com/asilkehribar" target="_blank" rel="noopener noreferrer" className="size-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-primary hover:text-stone-950 transition-all group" title="Instagram">
              <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="mailto:destek@asilkehribar.com" className="size-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-primary hover:text-stone-950 transition-all" title="E-posta">
              <span className="material-symbols-outlined text-sm">alternate_email</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Kategoriler</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/shop" className="hover:text-primary transition-colors">Baltık Koleksiyonu</Link></li>
            <li><Link to="/shop" className="hover:text-primary transition-colors">Zanaatkar Serisi</Link></li>
            <li><Link to="/shop" className="hover:text-primary transition-colors">Nadir Parçalar</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Kurumsal</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/about" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
            <li><Link to="/certificates" className="hover:text-primary transition-colors">Orijinallik Kaydı</Link></li>
            <li><Link to="/returns" className="hover:text-primary transition-colors">Güvenli İade</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center md:text-left">© 2024 Asil Kehribar.</p>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-10">
          <div className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-lg text-stone-300 dark:text-stone-700 group-hover:text-primary transition-colors">lock</span>
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-500">256-Bit SSL</p>
            </div>
          </div>
          <div className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-lg text-stone-300 dark:text-stone-700 group-hover:text-primary transition-colors">verified_user</span>
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-500">3D Secure</p>
            </div>
          </div>
          <div className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-lg text-stone-300 dark:text-stone-700 group-hover:text-primary transition-colors">encrypted</span>
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-500">KVKK Uyumlu</p>
            </div>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2 hidden md:block"></div>

          <div className="flex gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" className="h-3 md:h-3 object-contain" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/512px-MasterCard_Logo.svg.png" className="h-4 md:h-4 object-contain" alt="Mastercard" />
          </div>
        </div>

      </div>
    </div>
  </footer>
);

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Data States
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(DEFAULT_BLOG_POSTS);

  // Load State
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const API_URL = "/api/backend.php"; // Değiştirmeyin; üretimde (production) kök klasörden alacak.

  // 1. AŞAMA: SAYFA AÇILINCA API'DEN (VERİTABANINDAN) VERİLERİ ÇEK
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log("Sunucudan veritabanı ayarları çekiliyor...");

        // Ürünler
        const proRes = await fetch(`${API_URL}?action=get_products`);
        if (proRes.ok) {
          const pData = await proRes.json();
          if (Array.isArray(pData) && pData.length > 0) setProducts(pData);
        }

        // Slaytlar
        const slideRes = await fetch(`${API_URL}?action=get_slides`);
        if (slideRes.ok) {
          const sData = await slideRes.json();
          if (Array.isArray(sData) && sData.length > 0) setSlides(sData);
        }

        // Blog
        const blogRes = await fetch(`${API_URL}?action=get_blog`);
        if (blogRes.ok) {
          const bData = await blogRes.json();
          if (Array.isArray(bData) && bData.length > 0) setBlogPosts(bData);
        }

        // Ayarlar
        const setRes = await fetch(`${API_URL}?action=get_settings`);
        if (setRes.ok) {
          const setObj = await setRes.json();
          if (Object.keys(setObj).length > 0) setSettings(setObj as SiteSettings);
        }

        setIsDataLoaded(true); // Veriler güvenle çekildi, artık kaydetmeye hazırız
      } catch (err) {
        console.error("Veritabanına bağlanılamadı, varsayılan (Yerel) sistem kullanılıyor.", err);
        // Hata durumunda (DB henüz yoksa vb.) yine de ekranın açılmasını sağla
        setIsDataLoaded(true);
      }
    };

    fetchAllData();
  }, []);

  // 2. AŞAMA: BİR ŞEY DEĞİŞTİĞİNDE VERİTABANINA (API) GERİ YAZ
  useEffect(() => {
    if (!isDataLoaded) return; // Henüz veri çekilmeden boş datayı kaydetmesin
    fetch(`${API_URL}?action=save_products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    }).catch(console.error);
    localStorage.setItem('asil_products', JSON.stringify(products)); // Yedek amaçlı locale de yaz
  }, [products, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    fetch(`${API_URL}?action=save_slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slides)
    }).catch(console.error);
  }, [slides, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    fetch(`${API_URL}?action=save_settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(console.error);
  }, [settings, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    fetch(`${API_URL}?action=save_blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogPosts)
    }).catch(console.error);
  }, [blogPosts, isDataLoaded]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const isFav = prev.find(p => p.id === product.id);
      if (isFav) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const favCount = favorites.length;

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white dark:bg-background-dark text-stone-900 dark:text-zinc-100 transition-colors duration-300">
        <Navbar cartCount={cartCount} favCount={favCount} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home onAddToCart={addToCart} favorites={favorites} onToggleFavorite={toggleFavorite} products={products} slides={slides} />} />
            <Route path="/shop" element={<Shop onAddToCart={addToCart} favorites={favorites} onToggleFavorite={toggleFavorite} products={products} />} />
            <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} favorites={favorites} onToggleFavorite={toggleFavorite} products={products} />} />
            <Route path="/about" element={<About settings={settings} />} />
            <Route path="/blog" element={<Blog blogPosts={blogPosts} />} />
            <Route path="/contact" element={<Contact settings={settings} />} />
            <Route path="/checkout" element={<Checkout cart={cart} onRemove={removeFromCart} />} />
            <Route path="/admin" element={<Admin products={products} setProducts={setProducts} slides={slides} setSlides={setSlides} settings={settings} setSettings={setSettings} blogPosts={blogPosts} setBlogPosts={setBlogPosts} />} />
            <Route path="/favorites" element={<Favorites favorites={favorites} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/certificates" element={<Certificates />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
