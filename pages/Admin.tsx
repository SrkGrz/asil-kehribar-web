
import React, { useState, useEffect } from 'react';
import { MOCK_ORDERS, MOCK_CUSTOMERS } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { fetchApi } from '../api';
import { AmberType, Product, Slide, SiteSettings, BlogPost } from '../types';
type AdminView = 'dashboard' | 'products' | 'orders' | 'customers' | 'settings' | 'import' | 'integrations' | 'slides' | 'blog' | 'users' | 'about';

const DEFAULT_PASSWORD = "admin";

interface AdminProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

export const Admin: React.FC<AdminProps> = ({ products, setProducts, slides, setSlides, settings, setSettings, blogPosts, setBlogPosts }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | null>(null);
  // Application State
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [emailInput, setEmailInput] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [error, setError] = useState('');

  // User Management
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor'>('editor');
  const [newUserError, setNewUserError] = useState('');
  const [newUserSuccess, setNewUserSuccess] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    if (activeView === 'users' && userRole === 'admin') {
      fetchApi('/api/users').then(data => {
        setUsersList(data);
      }).catch(e => {
        console.warn('Kullanıcılar alınamadı, lokal liste aktif.', e);
        if (usersList.length === 0) {
          setUsersList([{ id: 'demo1', email: 'admin@asilkehribar.com', role: 'admin', status: 'active' }, { id: 'demo2', email: 'editor@asilkehribar.com', role: 'editor', status: 'active' }]);
        }
      });
    }
  }, [activeView, userRole]);

  const handleToggleUserBlock = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    fetchApi(`/api/users/${id}/block`, { method: 'POST', body: JSON.stringify({ status: newStatus }) }).catch(e => console.warn(e));
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    alert(newStatus === 'blocked' ? 'Kullanıcı başarıyla engellendi.' : 'Kullanıcının engeli kaldırıldı.');
  };

  const handleResetPasswordAdmin = async (email: string) => {
    alert("MongoDB Atlas backend formatı için şifre sıfırlama e-posta servisi (SMTP) ayarlanmalıdır. Lokal testtesiniz.");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError('');
    setNewUserSuccess('');
    try {
      const created = await fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: newUserEmail, password: newUserPass, role: newUserRole }) });
      const newUser = { id: created.id, email: created.email, role: created.role, status: created.status || 'active' };
      setUsersList(prev => [newUser, ...prev]);
      setNewUserSuccess('Kullanıcı başarıyla oluşturuldu ve veritabanına kaydedildi.');
      setNewUserEmail('');
      setNewUserPass('');
    } catch (err: any) {
      setNewUserError('Kullanıcı oluşturulamadı: ' + err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await fetchApi(`/api/users/${id}`, { method: 'DELETE' });
      setUsersList(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert('Kullanıcı silinemedi: ' + err.message);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { user } = await fetchApi('/api/auth/session');
        if (user) {
          if (user.status === 'blocked') {
            alert("Hesabınız yöneticiler tarafından engellenmiştir.");
            localStorage.removeItem('asil_auth_token');
            return;
          }
          setAuthUser(user);
          setIsAdminAuthenticated(true);
          setUserRole(user.role);
        }
      } catch (err) {
        setAuthUser(null);
        setIsAdminAuthenticated(false);
        setUserRole(null);
      }
    };
    initSession();
  }, []);

  const [passChange, setPassChange] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passSuccess, setPassSuccess] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      await fetchApi('/api/settings', { method: 'POST', body: JSON.stringify(settings) });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert('Ayarlar kaydedilemedi: ' + err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Product Management States
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    longDescription: '',
    specs: '',
    size: '',
    color: '',
    type: 'Diğer',
    image: ''
  });

  // Smart Import States
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedProduct, setImportedProduct] = useState<Partial<Product> | null>(null);

  // XML Integration States
  const [xmlUrl, setXmlUrl] = useState('');
  const [xmlStatus, setXmlStatus] = useState<'idle' | 'testing' | 'active'>('idle');

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Slide Management States
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide>>({
    title: '',
    subtitle: '',
    tag: '',
    image: ''
  });

  // Blog Management States
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  });
  const [isBlogSaving, setIsBlogSaving] = useState(false);
  const [blogSaved, setBlogSaved] = useState(false);

  const saveBlogPost = async () => {
    if (!editingBlogPost.title || !editingBlogPost.content) return;
    setIsBlogSaving(true);
    try {
      let id = editingBlogPost.id;
      if (!id) id = Date.now().toString();
      const newPost = { ...editingBlogPost, id } as BlogPost;
      await fetchApi('/api/blog', { method: 'POST', body: JSON.stringify(newPost) });
      setBlogPosts(prev => {
        const exists = prev.find(p => p.id === id);
        if (exists) return prev.map(p => p.id === id ? newPost : p);
        return [...prev, newPost];
      });
      setBlogSaved(true);
      setTimeout(() => {
        setBlogSaved(false);
        setIsEditingBlog(false);
        setEditingBlogPost({ title: '', excerpt: '', content: '', image: '', date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) });
      }, 1000);
    } catch (err: any) {
      alert('Blog kaydedilemedi: ' + err.message);
    } finally {
      setIsBlogSaving(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;
    try {
      await fetchApi(`/api/blog/${id}`, { method: 'DELETE' });
      setBlogPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Blog silinemedi: ' + err.message);
    }
  };

  const startEditBlog = (post: BlogPost) => {
    setEditingBlogPost(post);
    setIsEditingBlog(true);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Lütfen sadece resim/görsel dosyası yükleyin.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            callback(dataUrl);
          } else {
            callback(reader.result as string);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: emailInput, password: inputPass }) });
      if (response.token) {
        localStorage.setItem('asil_auth_token', response.token);
        setError('');
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Hatalı giriş veya şifre!');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPassSuccess('');

    if (passChange.new.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }
    if (passChange.new !== passChange.confirm) {
      setError('Yeni şifreler eşleşmiyor!');
      return;
    }

    try {
      await fetchApi('/api/auth/updatePassword', { method: 'POST', body: JSON.stringify({ password: passChange.new }) });
      setPassSuccess('Şifreniz başarıyla güncellendi.');
      setPassChange({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setError('Şifre güncellenemedi: ' + err.message);
    }
  };

  const handleSmartImport = async () => {
    if (!importUrl.trim()) return;
    setIsImporting(true);
    setImportedProduct(null);

    try {
      const apiKey = process.env.API_KEY || localStorage.getItem('asil_gemini_api_key');
      if (!apiKey) {
        throw new Error("Lütfen API Anahtarınızı (.env doyanıza API_KEY olarak veya ayarlara) ekleyiniz.");
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Bu URL'deki ürünü incele ve mağaza için uygun bir JSON döndür: ${importUrl}. Sadece JSON döndür. 
        Format: { "name": "ürün adı", "price": "1250 (sadece sayı)", "description": "kısa açıklama", "longDescription": "detaylı hikaye", "specs": "9x12mm • Gümüş", "image": "ana görsel URL'si" }
        Tür (type) olarak şunlardan birini seç: "Damla (Baltık)", "Sıkma Kehribar", "Ateş Kehribar", "Osmanlı Tarzı".`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, ''); // Temizlik önlemi
      const data = JSON.parse(cleanJson);

      setImportedProduct({
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        price: Number(data.price) || 0,
        type: data.type || AmberType.ATES
      });
    } catch (error: any) {
      console.error("İçe aktarma hatası:", error);
      alert(`Hata: ${error.message || "Ürün bilgileri çekilemedi."}\nEğer API Key girmediyseniz çalışmayabilir.`);
    } finally {
      setIsImporting(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditing(true);
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    try {
      await fetchApi(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Ürün silinemedi: ' + err.message);
    }
  };

  const saveProduct = async () => {
    try {
      const id = editingProduct.id || Math.random().toString(36).substr(2, 9);
      const newProd = { ...editingProduct, id } as Product;
      await fetchApi('/api/products', { method: 'POST', body: JSON.stringify(newProd) });
      setProducts(prev => {
        const exists = prev.find(p => p.id === id);
        if (exists) return prev.map(p => p.id === id ? newProd : p);
        return [...prev, newProd];
      });
      setIsEditing(false);
      setEditingProduct({ name: '', price: 0, description: '', longDescription: '', specs: '', size: '', color: '', type: 'Diğer', image: '' });
    } catch (err: any) {
      alert('Ürün kaydedilemedi: ' + err.message);
    }
  };

  const saveSlide = async () => {
    try {
      if (!editingSlide.title || !editingSlide.image) {
        alert("Başlık ve Görsel zorunludur!");
        return;
      }
      const id = editingSlide.id || Math.random().toString(36).substr(2, 9);
      const newSlide = {
        ...editingSlide,
        id,
        title: editingSlide.title || 'İsimsiz Slayt',
        subtitle: editingSlide.subtitle || '',
        tag: editingSlide.tag || '',
        image: editingSlide.image || ''
      } as Slide;

      await fetchApi('/api/slides', { method: 'POST', body: JSON.stringify(newSlide) });

      setSlides(prev => {
        const existing = prev.find(s => s.id === id);
        if (existing) return prev.map(s => s.id === id ? newSlide : s);
        return [...prev, newSlide];
      });

      setIsEditingSlide(false);
      setEditingSlide({ title: '', subtitle: '', tag: '', image: '' });
    } catch (e: any) {
      console.error("Slayt kaydedilemedi", e);
      alert("Slayt kaydedilirken hata oluştu: " + e.message);
    }
  };

  const deleteSlide = async (id: string) => {
    if (!window.confirm('Bu slaytı silmek istediğinizden emin misiniz?')) return;
    try {
      await fetchApi(`/api/slides/${id}`, { method: 'DELETE' });
      setSlides(prev => prev.filter(slide => slide.id !== id));
    } catch (e: any) {
      console.error("Slayt silinemedi", e);
      alert("Slayt silinirken hata oluştu: " + e.message);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-zinc-50 dark:bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-white rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-100 p-10 text-center animate-in fade-in zoom-in duration-300">
          <div className="size-20 rounded-full bg-primary mx-auto flex items-center justify-center text-stone-950 mb-6 shadow-xl shadow-primary/20">
            <span className="material-symbols-outlined text-4xl">castle</span>
          </div>
          <h1 className="text-3xl font-display font-black italic mb-2 text-stone-950">Saray Yönetimi</h1>
          <p className="text-stone-500 text-sm mb-8">Devam etmek için yönetici şifrenizi giriniz.</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-posta Adresi"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-2xl p-4 font-bold text-center focus:ring-2 focus:ring-primary text-stone-950 mb-4"
              autoFocus
            />
            <input
              type="password"
              placeholder="Şifre"
              value={inputPass}
              onChange={(e) => setInputPass(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-2xl p-4 font-bold text-center focus:ring-2 focus:ring-primary text-stone-950"
            />
            {error && <p className="text-red-500 text-xs font-bold uppercase">{error}</p>}
            <button type="submit" className="w-full bg-primary text-stone-950 font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              SİSTEME GİRİŞ YAP
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-display font-black italic mb-2">Padişahın Otağı</h1>
              <p className="text-stone-500">Sarayın genel envanter ve koleksiyon durumuna göz atın.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Toplam Eser', value: products.length, icon: 'inventory_2', color: 'bg-amber-500' },
                { label: 'Aktif Sipariş', value: MOCK_ORDERS.length, icon: 'shopping_basket', color: 'bg-emerald-500' },
                { label: 'Koleksiyoncu', value: MOCK_CUSTOMERS.length, icon: 'group', color: 'bg-blue-500' },
                { label: 'Blog Yazısı', value: blogPosts.length, icon: 'article', color: 'bg-purple-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:scale-105 transition-transform">
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 ${stat.color} opacity-5 rounded-full`}></div>
                  <div className="relative z-10">
                    <div className={`size-12 rounded-2xl ${stat.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-${stat.label === 'Toplam Eser' ? 'amber' : i === 1 ? 'emerald' : i === 2 ? 'blue' : 'purple'}-500/20`}>
                      <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{stat.label}</p>
                    <p className="text-4xl font-display font-black italic text-stone-950 dark:text-white leading-none">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid: Orders & Actions */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Recent Orders */}
              <div className="lg:col-span-8 bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="font-black italic text-xl">Son Sipariş Akışı</h3>
                  <button onClick={() => setActiveView('orders')} className="text-[10px] font-black uppercase text-primary hover:underline underline-offset-4">Tümünü Gör →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                      {MOCK_ORDERS.slice(0, 5).map(order => (
                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400">
                                <span className="material-symbols-outlined text-sm">inventory</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm">{order.customer}</p>
                                <p className="text-[10px] text-stone-400">{order.id} • {order.date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <p className="font-black text-primary italic text-sm">{order.total}</p>
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-stone-400">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-stone-900 dark:bg-zinc-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                    <span className="material-symbols-outlined text-[120px]">auto_fix_high</span>
                  </div>
                  <h3 className="text-xl font-black italic mb-4 relative z-10">Akıllı Yönetim</h3>
                  <p className="text-sm text-stone-400 mb-8 relative z-10 leading-relaxed">Yapay zeka asistanı ile envanterinizi saniyeler içinde zenginleştirin.</p>
                  <button onClick={() => setActiveView('import')} className="w-full bg-primary text-stone-950 py-4 rounded-xl font-black text-xs uppercase tracking-widest relative z-10 hover:scale-105 transition-all">İÇE AKTARMA BAŞLAT</button>
                </div>

                <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-stone-400 mb-6 tracking-widest">Hızlı Erişim</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setEditingProduct({ name: '', price: 0, description: '', specs: '', type: AmberType.ATES, image: '' }); setIsEditing(true); setActiveView('products'); }} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                      <span className="material-symbols-outlined text-amber-600">add_circle</span>
                      <span className="text-[10px] font-bold">Yeni Ürün</span>
                    </button>
                    <button onClick={() => { setEditingBlogPost({ title: '', excerpt: '', content: '', image: '', date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) }); setIsEditingBlog(true); setActiveView('blog'); }} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                      <span className="material-symbols-outlined text-purple-600">post_add</span>
                      <span className="text-[10px] font-bold">Blog Yaz</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'products':
        if (isEditing) {
          return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <button onClick={() => setIsEditing(false)} className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> LİSTEYE DÖN
                  </button>
                  <h1 className="text-4xl font-display font-black italic mb-2">
                    {editingProduct.id ? 'Ürünü Düzenle' : 'Yeni Eser Ekle'}
                  </h1>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 font-bold text-sm">Vazgeç</button>
                  <button onClick={saveProduct} className="px-6 py-3 rounded-lg bg-primary text-stone-950 font-black text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    {editingProduct.id ? 'DEĞİŞİKLİKLERİ KAYDET' : 'ESERİ YAYINLA'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white dark:bg-stone-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl font-black italic mb-8 flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">info</span> Genel Bilgiler
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Ürün Adı</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-bold"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Fiyat (₺)</label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Tür</label>
                          <div className="space-y-3">
                            <input
                              type="text"
                              list="amber-types"
                              value={editingProduct.type}
                              onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })}
                              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-bold"
                              placeholder="Tür girin veya seçin..."
                            />
                            <datalist id="amber-types">
                              {Object.values(AmberType).map(t => <option key={t} value={t} />)}
                            </datalist>
                            <div className="flex flex-wrap gap-2">
                              {Object.values(AmberType).map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setEditingProduct({ ...editingProduct, type: t })}
                                  className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase transition-all ${editingProduct.type === t ? 'bg-primary text-stone-950 shadow-md' : 'bg-zinc-100 dark:bg-stone-900 text-stone-500 hover:text-primary'}`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Ölçü (Örn: 9x12mm)</label>
                          <input
                            type="text"
                            value={editingProduct.size}
                            onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Özellikler (Örn: Gümüş Kamçı)</label>
                          <input
                            type="text"
                            value={editingProduct.specs}
                            onChange={(e) => setEditingProduct({ ...editingProduct, specs: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Açıklama (Kısa Özet)</label>
                        <textarea
                          rows={2}
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Detaylı Açıklama (Sayfanın altındaki geniş metin)</label>
                        <textarea
                          rows={6}
                          value={editingProduct.longDescription}
                          onChange={(e) => setEditingProduct({ ...editingProduct, longDescription: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white dark:bg-stone-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl font-black italic mb-8 flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">image</span> Ürün Görseli
                    </h2>
                    <div className="space-y-4">
                      {editingProduct.image && (
                        <div className="relative group">
                          <img src={editingProduct.image || undefined} className="w-full aspect-square object-cover rounded-xl mb-4 shadow-lg" alt="Preview" />
                          <button
                            onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                            className="absolute top-2 right-2 size-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, (base64) => setEditingProduct({ ...editingProduct, image: base64 }))}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group"
                        >
                          <span className="material-symbols-outlined text-4xl text-stone-300 group-hover:text-primary mb-2">add_photo_alternate</span>
                          <span className="text-[10px] font-black uppercase text-stone-400 group-hover:text-primary">Görsel Yükle</span>
                          <span className="text-[9px] text-stone-400 mt-2 font-bold">Önerilen: 800x1000px (4:5)</span>
                          <span className="text-[9px] text-stone-400 font-bold">Maksimum: 2MB</span>
                        </label>
                      </div>
                      <div className="pt-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Veya Görsel URL</label>
                        <input
                          type="text"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                          placeholder="https://..."
                        />
                      </div>
                      <p className="text-[9px] text-stone-400 text-center italic">Önerilen: 800x1000px JPG/PNG</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-4xl font-display font-black italic mb-2">Koleksiyon Yönetimi</h1>
                <p className="text-stone-500">Saray envanterindeki ürünleri düzenleyin veya yenilerini ekleyin.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({ name: '', price: 0, description: '', longDescription: '', specs: '', size: '', color: '', type: 'Diğer', image: '' });
                  setIsEditing(true);
                }}
                className="bg-primary text-stone-950 px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined">add_circle</span> YENİ ESER EKLE
              </button>
            </div>

            <div className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Eser</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Tür</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Fiyat</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={product.image || undefined} className="size-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800" alt="" />
                          <div>
                            <p className="font-bold text-sm line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-stone-400 font-medium">{product.specs}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase text-stone-500">
                          {product.type}
                        </span>
                      </td>
                      <td className="p-6 font-black text-primary italic">₺{product.price.toLocaleString('tr-TR')}</td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="size-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-primary hover:text-stone-950 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="size-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-display font-black italic mb-2">Entegrasyonlar</h1>
              <p className="text-stone-500">Sarayın dijital kapılarını dış dünyaya açın.</p>
            </div>

            <div className="grid gap-8">
              <div className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">xml</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic">XML Ürün Feed Entegrasyonu</h3>
                      <p className="text-xs text-stone-500 uppercase font-bold tracking-widest mt-0.5">Tedarikçi Senkronizasyonu</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${xmlStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {xmlStatus === 'active' ? 'Bağlı' : 'Beklemede'}
                  </span>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-2 tracking-widest">XML URL (HTTP/HTTPS)</label>
                        <input
                          type="text"
                          value={xmlUrl}
                          onChange={(e) => setXmlUrl(e.target.value)}
                          placeholder="https://tedarikci.com/export/products.xml"
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-medium focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setXmlStatus('testing');
                            setTimeout(() => setXmlStatus('active'), 1500);
                          }}
                          className="flex-1 bg-stone-950 text-white dark:bg-zinc-100 dark:text-stone-950 py-4 rounded-xl font-black text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2"
                        >
                          {xmlStatus === 'testing' ? <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">sync</span>}
                          BAĞLANTIYI TEST ET
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'import':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-display font-black italic mb-2">Akıllı İçe Aktarma</h1>
              <p className="text-stone-500">Dış dünyadaki bir eseri saraya dahil etmek için URL'sini yapıştırın.</p>
            </div>

            <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">link</span>
                  <input
                    type="text"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-5 pl-12 pr-4 font-medium focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Ürün sayfasının linkini buraya yapıştırın..."
                  />
                </div>
                <button
                  onClick={handleSmartImport}
                  disabled={isImporting}
                  className="bg-stone-950 dark:bg-primary text-white dark:text-stone-950 px-8 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isImporting ? (
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined">auto_fix_high</span>
                  )}
                  ANALİZ ET
                </button>
              </div>

              {importedProduct && (
                <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="font-black uppercase tracking-widest text-xs">Eser Analiz Edildi</span>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-10 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    <div className="aspect-[4/5] rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                      <img src={importedProduct.image || undefined} className="size-full object-cover" alt="Imported" />
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={importedProduct.name || ''}
                        onChange={(e) => setImportedProduct({ ...importedProduct, name: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-600 focus:ring-0 text-2xl font-display font-black italic p-0"
                      />
                      <div className="flex items-center gap-2 text-primary font-black text-xl italic">
                        ₺ <input
                          type="number"
                          value={importedProduct.price || 0}
                          onChange={(e) => setImportedProduct({ ...importedProduct, price: Number(e.target.value) })}
                          className="bg-transparent border-0 p-0 w-32 focus:ring-0"
                        />
                      </div>
                      {importedProduct.specs && <p className="text-sm text-stone-500">{importedProduct.specs}</p>}
                      <textarea
                        value={importedProduct.description || ''}
                        onChange={(e) => setImportedProduct({ ...importedProduct, description: e.target.value })}
                        className="w-full bg-transparent border-0 text-sm leading-relaxed p-0 focus:ring-0 resize-none"
                        rows={3}
                      />
                      <button className="w-full mt-4 bg-primary text-stone-950 font-black py-4 rounded-xl shadow-lg shadow-primary/20">SARAY KOLEKSİYONUNA EKLE</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'orders':
        if (selectedOrder) {
          return (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-12">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> SİPARİŞLERE DÖN
                </button>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-stone-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-stone-950 transition-all">FATURA YAZDIR</button>
                  <button className="px-4 py-2 rounded-lg bg-primary text-stone-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">KARGOYA VER</button>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-display font-black italic mb-1">Sipariş {selectedOrder.id}</h2>
                    <p className="text-stone-500 text-sm">{selectedOrder.date} tarihinde oluşturuldu</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">{selectedOrder.status}</span>
                  </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-12 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-stone-400 mb-4 tracking-widest">Müşteri Bilgileri</h3>
                    <p className="font-bold text-lg mb-1">{selectedOrder.customer}</p>
                    <p className="text-sm text-stone-500 mb-4">koleksiyoncu@example.com</p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Bağdat Caddesi No:123 D:4<br />
                      Kadıköy, İstanbul / Türkiye
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-stone-400 mb-4 tracking-widest">Ödeme Özeti</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Ara Toplam</span>
                        <span className="font-bold">{selectedOrder.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Kargo</span>
                        <span className="font-bold text-green-600">Ücretsiz</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-lg">
                        <span className="font-black italic">Toplam</span>
                        <span className="font-black italic text-primary">{selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-[10px] font-black uppercase text-stone-400 mb-6 tracking-widest">Sipariş İçeriği</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div className="size-16 rounded-xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <img src="https://picsum.photos/seed/amber1/200/200" className="size-full object-cover" alt="" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">Özel Kesim Baltık Damla Kehribar</p>
                        <p className="text-[10px] text-stone-400 uppercase font-black">9x12mm • Gümüş İmame</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary italic">{selectedOrder.total}</p>
                        <p className="text-[10px] text-stone-400 font-bold">1 Adet</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-display font-black italic mb-8">Sipariş Akışı</h1>
            <div className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Sipariş No</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Müşteri</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Tarih</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Tutar</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Durum</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {MOCK_ORDERS.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-6 font-bold text-sm">{order.id}</td>
                      <td className="p-6 text-sm font-medium">{order.customer}</td>
                      <td className="p-6 text-sm opacity-60">{order.date}</td>
                      <td className="p-6 font-black text-primary italic text-sm">{order.total}</td>
                      <td className="p-6">
                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-black uppercase text-stone-500">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-stone-950 font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'customers':
        if (selectedCustomer) {
          return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-12">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> LİSTEYE DÖN
                </button>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-stone-950 transition-all">E-POSTA GÖNDER</button>
                  <button className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">HESABI ASKIYA AL</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
                    <div className="size-24 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-3xl font-black mb-6">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-display font-black italic mb-1">{selectedCustomer.name}</h2>
                    <p className="text-stone-500 text-sm mb-6">{selectedCustomer.email}</p>
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Sipariş</p>
                        <p className="font-black text-lg">{selectedCustomer.orders}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Harcama</p>
                        <p className="font-black text-lg text-primary italic">{selectedCustomer.spent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">contact_page</span> İletişim Bilgileri
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-stone-500 mb-1">Telefon</p>
                        <p className="text-sm font-bold">+90 (555) 000 00 00</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-stone-500 mb-1">Adres</p>
                        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">İstanbul, Türkiye</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-stone-500 mb-1">Kayıt Tarihi</p>
                        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">12 Ocak 2024</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity / Orders */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <h3 className="font-black italic">Sipariş Geçmişi</h3>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">Son 12 Ay</span>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                          <th className="p-4 text-[10px] font-black uppercase text-stone-500">Sipariş No</th>
                          <th className="p-4 text-[10px] font-black uppercase text-stone-500">Tarih</th>
                          <th className="p-4 text-[10px] font-black uppercase text-stone-500">Tutar</th>
                          <th className="p-4 text-[10px] font-black uppercase text-stone-500">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {MOCK_ORDERS.filter(o => o.customer === selectedCustomer.name).map((order) => (
                          <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="p-4 font-bold text-sm">{order.id}</td>
                            <td className="p-4 text-sm opacity-60">{order.date}</td>
                            <td className="p-4 font-black text-primary italic text-sm">{order.total}</td>
                            <td className="p-4 text-sm">
                              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase">{order.status}</span>
                            </td>
                          </tr>
                        ))}
                        {MOCK_ORDERS.filter(o => o.customer === selectedCustomer.name).length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-stone-400 italic text-sm">Henüz bir sipariş kaydı bulunmamaktadır.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">En Çok İlgi Duyduğu Tür</h3>
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">diamond</span>
                        </div>
                        <div>
                          <p className="font-black text-lg italic">Baltık Damla</p>
                          <p className="text-[10px] text-stone-500 uppercase font-bold">Koleksiyonun %60'ı</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">Müşteri Notu</h3>
                      <p className="text-sm italic text-stone-500 leading-relaxed">"Özel kesim ve usta imzalı parçalara ilgi duyuyor. Yeni gelen damla kehribarlar için bilgilendirme bekliyor."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-display font-black italic mb-8">Koleksiyoncular</h1>
            <div className="bg-white dark:bg-stone-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Müşteri</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">E-posta</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Sipariş Sayısı</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Toplam Harcama</th>
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {MOCK_CUSTOMERS.map((customer) => (
                    <tr key={customer.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-sm border border-zinc-200 dark:border-zinc-700">
                            {customer.name.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{customer.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm opacity-60">{customer.email}</td>
                      <td className="p-6 text-sm font-bold">{customer.orders} Adet</td>
                      <td className="p-6 font-black text-primary italic text-sm">{customer.spent}</td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="px-4 py-2 rounded-lg bg-stone-950 dark:bg-primary text-white dark:text-stone-950 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                          İncele
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-4xl font-display font-black italic mb-2">Hakkımızda Sayfası</h1>
                <p className="text-stone-500">Hakkımızda sayfasındaki metin ve görselleri düzenleyin.</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="flex items-center gap-3 bg-primary text-stone-950 px-8 py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
              >
                {settingsSaving ? (
                  <div className="size-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                {settingsSaved ? 'KAYDEDİLDİ ✓' : 'KAYDET'}
              </button>
            </div>

            <div className="space-y-10">
              <section className="bg-white dark:bg-stone-950 p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-black italic mb-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  İçerik & Metinler
                </h2>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Başlık</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      value={settings.aboutTitle}
                      onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Paragraf 1</label>
                    <textarea
                      rows={4}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-medium"
                      value={settings.aboutText1}
                      onChange={(e) => setSettings({ ...settings, aboutText1: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Paragraf 2</label>
                    <textarea
                      rows={4}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-medium"
                      value={settings.aboutText2}
                      onChange={(e) => setSettings({ ...settings, aboutText2: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Tecrübe (Yıl)</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      value={settings.aboutYears}
                      onChange={(e) => setSettings({ ...settings, aboutYears: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Koleksiyoncu Sayısı</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      value={settings.aboutCustomers}
                      onChange={(e) => setSettings({ ...settings, aboutCustomers: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-stone-950 p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-black italic mb-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">image</span>
                  Görseller
                </h2>
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Hero Görseli (En Üst)</label>
                    {settings.aboutHeroImage && (
                      <img src={settings.aboutHeroImage} className="w-full h-40 object-cover mb-4 border border-zinc-200 dark:border-zinc-700" alt="Hero önizleme" />
                    )}
                    <div className="flex flex-col gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (base64) => setSettings({ ...settings, aboutHeroImage: base64 }))}
                        className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary file:text-stone-950 hover:file:bg-stone-950 hover:file:text-white cursor-pointer"
                      />
                      <input
                        type="text"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold text-xs"
                        placeholder="Veya URL girin..."
                        value={settings.aboutHeroImage}
                        onChange={(e) => setSettings({ ...settings, aboutHeroImage: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">İçerik Görseli (Hikayemiz)</label>
                    {settings.aboutContentImage && (
                      <img src={settings.aboutContentImage} className="w-full h-40 object-cover mb-4 border border-zinc-200 dark:border-zinc-700" alt="İçerik önizleme" />
                    )}
                    <div className="flex flex-col gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (base64) => setSettings({ ...settings, aboutContentImage: base64 }))}
                        className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary file:text-stone-950 hover:file:bg-stone-950 hover:file:text-white cursor-pointer"
                      />
                      <input
                        type="text"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold text-xs"
                        placeholder="Veya URL girin..."
                        value={settings.aboutContentImage}
                        onChange={(e) => setSettings({ ...settings, aboutContentImage: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );

      case 'settings':

        return (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-4xl font-display font-black italic mb-2">Genel Ayarlar</h1>
                <p className="text-stone-500">Mağaza tercihlerini ve sistem yapılandırmasını yönetin.</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="flex items-center gap-3 bg-primary text-stone-950 px-8 py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
              >
                {settingsSaving ? (
                  <div className="size-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                {settingsSaved ? 'KAYDEDILDI ✓' : 'KAYDET'}
              </button>
            </div>

            <div className="space-y-10">
              <section className="bg-white dark:bg-stone-950 p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-black italic mb-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">store</span>
                  Saray Profili (İletişim Bilgileri)
                </h2>
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Destek E-postası</label>
                    <input
                      type="email"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Telefon Numarası</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Açık Adres (Atölye)</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Instagram Bağlantısı</label>
                    <input
                      type="url"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      value={settings.instagram}
                      onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              {/* API and Integration Settings */}
              <section className="bg-white dark:bg-stone-950 p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-black italic mb-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">api</span>
                  Yapay Zeka (AI) Bağlantısı
                </h2>
                <div className="grid gap-10">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Google Gemini API Anahtarı</label>
                    <input
                      type="password"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      placeholder="AI-..."
                      value={localStorage.getItem('asil_gemini_api_key') || ''}
                      onChange={(e) => {
                        localStorage.setItem('asil_gemini_api_key', e.target.value);
                        setSettings({ ...settings });
                      }}
                    />
                    <p className="text-[10px] font-bold text-stone-400 mt-3">Akıllı "İçe Aktar (AI)" özelliğini kullanabilmek için bu alanın dolu olması gereklidir. API anahtarlarına Google AI Studio üzerinden erişebilirsiniz.</p>
                  </div>
                </div>
              </section>

              {/* Password Change Section */}
              <section className="bg-white dark:bg-stone-950 p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-xl font-black italic mb-10 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">security</span>
                  Güvenlik & Şifre
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-8 max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Mevcut Şifre</label>
                      <input
                        type="password"
                        required
                        value={passChange.current}
                        onChange={(e) => setPassChange({ ...passChange, current: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Yeni Şifre</label>
                      <input
                        type="password"
                        required
                        value={passChange.new}
                        onChange={(e) => setPassChange({ ...passChange, new: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        required
                        value={passChange.confirm}
                        onChange={(e) => setPassChange({ ...passChange, confirm: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold"
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-xs font-black uppercase">{error}</p>}
                  {passSuccess && <p className="text-green-500 text-xs font-black uppercase">{passSuccess}</p>}
                  <button type="submit" className="bg-primary text-stone-950 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    ŞİFREYİ GÜNCELLE
                  </button>
                </form>
              </section>
            </div>
          </div>
        );

      case 'slides':
        if (isEditingSlide) {
          return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <button onClick={() => setIsEditingSlide(false)} className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> LİSTEYE DÖN
                  </button>
                  <h1 className="text-4xl font-display font-black italic mb-2">
                    {editingSlide.id ? 'Görseli Düzenle' : 'Yeni Vitrin Görseli'}
                  </h1>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsEditingSlide(false)} className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 font-bold text-sm">Vazgeç</button>
                  <button onClick={saveSlide} className="px-6 py-3 rounded-lg bg-primary text-stone-950 font-black text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    KAYDET
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Başlık</label>
                      <input
                        type="text"
                        value={editingSlide.title}
                        onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Alt Başlık</label>
                      <textarea
                        rows={3}
                        value={editingSlide.subtitle}
                        onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Etiket (Tag)</label>
                      <input
                        type="text"
                        value={editingSlide.tag}
                        onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                        placeholder="Örn: Nadir Parçalar • Asil Duruş"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Görsel Yükle</label>
                    <p className="text-[10px] text-stone-400 mb-4 font-bold">Önerilen: 1920x1080px (16:9) | Maksimum: 2MB</p>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (base64) => setEditingSlide({ ...editingSlide, image: base64 }))}
                        className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary file:text-stone-950 hover:file:bg-stone-950 hover:file:text-white cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-zinc-100"></div>
                        <span className="text-[8px] font-black text-stone-400 uppercase">Veya URL</span>
                        <div className="h-px flex-1 bg-zinc-100"></div>
                      </div>
                      <input
                        type="text"
                        value={editingSlide.image}
                        onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                        placeholder="Görsel URL'si yapıştırın..."
                      />
                    </div>
                    {editingSlide.image && (
                      <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-zinc-200">
                        <img src={editingSlide.image || undefined} className="size-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-4xl font-display font-black italic mb-2">Vitrin Yönetimi</h1>
                <p className="text-stone-500">Anasayfa giriş bölümündeki görselleri yönetin.</p>
              </div>
              <button
                onClick={() => {
                  setEditingSlide({ title: '', subtitle: '', tag: '', image: '' });
                  setIsEditingSlide(true);
                }}
                className="bg-stone-950 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-stone-950 transition-all shadow-xl"
              >
                <span className="material-symbols-outlined">add_photo_alternate</span> YENİ GÖRSEL EKLE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {slides.map(slide => (
                <div key={slide.id} className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm group">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={slide.image || undefined} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" alt={slide.title} />
                    <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{slide.tag}</span>
                      <h3 className="text-xl font-bold text-white mb-1">{slide.title}</h3>
                      <p className="text-xs text-white/70 line-clamp-1">{slide.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-6 flex justify-between items-center bg-stone-50/50">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSlide(slide);
                          setIsEditingSlide(true);
                        }}
                        className="size-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="size-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                    <span className="text-[10px] font-black uppercase text-stone-400">ID: {slide.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'blog':
        if (isEditingBlog) {
          return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <button onClick={() => setIsEditingBlog(false)} className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> LİSTEYE DÖN
                  </button>
                  <h1 className="text-4xl font-display font-black italic mb-2">
                    {editingBlogPost.id ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}
                  </h1>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsEditingBlog(false)} className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 font-bold text-sm">Vazgeç</button>
                  <button
                    onClick={saveBlogPost}
                    disabled={isBlogSaving}
                    className="flex items-center gap-3 bg-primary text-stone-950 px-8 py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isBlogSaving ? (
                      <div className="size-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-sm">save</span>
                    )}
                    {blogSaved ? 'KAYDEDILDI ✓' : 'KAYDET'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Başlık</label>
                      <input
                        type="text"
                        value={editingBlogPost.title}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, title: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Kısa Özet (Excerpt)</label>
                      <textarea
                        rows={3}
                        value={editingBlogPost.excerpt}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerpt: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">İçerik</label>
                      <textarea
                        rows={8}
                        value={editingBlogPost.content}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, content: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-medium text-stone-950"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Görsel Yükle</label>
                    <p className="text-[10px] text-stone-400 mb-4 font-bold">Önerilen: 800x600px (4:3) | Maksimum: 2MB</p>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (base64) => setEditingBlogPost({ ...editingBlogPost, image: base64 }))}
                        className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary file:text-stone-950 hover:file:bg-stone-950 hover:file:text-white cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-zinc-100"></div>
                        <span className="text-[8px] font-black text-stone-400 uppercase">Veya URL</span>
                        <div className="h-px flex-1 bg-zinc-100"></div>
                      </div>
                      <input
                        type="text"
                        value={editingBlogPost.image}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, image: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                        placeholder="Görsel URL'si yapıştırın..."
                      />
                    </div>
                    {editingBlogPost.image && (
                      <div className="mt-4 aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200">
                        <img src={editingBlogPost.image || undefined} className="size-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-4xl font-display font-black italic mb-2">Blog Yönetimi</h1>
                <p className="text-stone-500">Anasayfadaki blog yazılarını yönetin.</p>
              </div>
              <button
                onClick={() => {
                  setEditingBlogPost({ title: '', excerpt: '', content: '', image: '', date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) });
                  setIsEditingBlog(true);
                }}
                className="bg-stone-950 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-stone-950 transition-all shadow-xl"
              >
                <span className="material-symbols-outlined">post_add</span> YENİ YAZI EKLE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={post.image || undefined} className="size-full object-cover" alt={post.title} />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{post.date}</span>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-3 flex-1">{post.excerpt}</p>
                    <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditBlog(post)}
                          className="size-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => deleteBlogPost(post.id)}
                          className="size-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'users':
        if (userRole !== 'admin') {
          return <div className="max-w-5xl mx-auto py-20 text-center font-bold text-red-500 bg-red-50 rounded-2xl dark:bg-red-950">Bu sayfayı görüntüleme yetkiniz yok. Sadece Saray Nazırı (Admin) girebilir.</div>;
        }
        return (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-12">
            <div>
              <h1 className="text-4xl font-display font-black italic mb-8">Kullanıcı Yönetimi</h1>
              <p className="text-stone-500 mb-8">Bu sayfadan yeni alt yöneticiler ve editörler ekleyebilirsiniz. Ayrıca mevcut kullanıcıları engelleyebilir ve şifrelerini sıfırlayabilirsiniz.</p>
              <form onSubmit={handleCreateUser} className="space-y-4 max-w-md bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <input type="email" placeholder="Kullanıcı E-posta" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold" />
                <input type="password" placeholder="Geçici Şifre (En az 6 karakter)" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} required minLength={6} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold" />
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 font-bold outline-none cursor-pointer">
                  <option value="editor">İçerik Editörü</option>
                  <option value="admin">Saray Nazırı (Tam Yetkili)</option>
                </select>
                {newUserError && <p className="text-red-500 text-xs font-bold">{newUserError}</p>}
                {newUserSuccess && <p className="text-green-500 text-xs font-bold">{newUserSuccess}</p>}
                <button type="submit" className="w-full bg-primary text-stone-950 font-black py-4 rounded-xl shadow-lg hover:scale-105 transition-all">KULLANICIYI OLUŞTUR</button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Mevcut Kullanıcılar</h2>
              <div className="bg-white dark:bg-stone-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {usersList.length === 0 ? (
                    <li className="p-8 text-center text-stone-500 font-bold">Herhangi bir kullanıcı bulunamadı veya veritabanı bağlantısı yok.</li>
                  ) : usersList.map(u => (
                    <li key={u.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-base flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-stone-400">person</span>
                          {u.email}
                        </span>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{u.role === 'admin' ? 'Saray Nazırı' : 'Editör'}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${u.status === 'blocked' ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-500/10' : 'bg-green-50 text-green-500 border-green-200 dark:bg-green-500/10'}`}>
                            {u.status === 'blocked' ? 'Engellendi' : 'Aktif'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button onClick={() => handleResetPasswordAdmin(u.email)} className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-stone-950 dark:text-white text-xs font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
                          <span className="material-symbols-outlined text-sm">key</span> Şifre Sıfırla
                        </button>
                        <button onClick={() => handleToggleUserBlock(u.id, u.status || 'active')} className={`border px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${u.status === 'blocked' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20'}`}>
                          <span className="material-symbols-outlined text-sm">{u.status === 'blocked' ? 'check_circle' : 'block'}</span>
                          {u.status === 'blocked' ? 'Engeli Kaldır' : 'Kullanıcıyı Engelle'}
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="border px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 dark:bg-red-500/10 dark:hover:bg-red-500/30">
                          <span className="material-symbols-outlined text-sm">delete</span> Sil
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20 text-center">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-5xl">analytics</span>
            </div>
            <h2 className="text-2xl font-black italic mb-2">Saray Analizleri</h2>
            <p className="text-stone-500">Bu bölüm yakında istatistiklerle doldurulacaktır.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-80px)] bg-zinc-50 dark:bg-stone-950">
      {/* Mini Sidebar */}
      <aside className="w-full xl:w-72 xl:h-[calc(100vh-80px)] xl:sticky xl:top-0 bg-white dark:bg-stone-950 border-b xl:border-b-0 xl:border-r border-zinc-200 dark:border-zinc-800 flex flex-row xl:flex-col p-4 xl:p-6 gap-2 overflow-x-auto xl:overflow-y-auto custom-scrollbar shrink-0">
        <div className="hidden xl:block mb-10 px-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yönetim Paneli</h3>
          <p className="text-[9px] font-bold text-primary mt-1">Sürüm 2.0.0-Royal</p>
        </div>
        <div className="flex flex-row xl:flex-col gap-2">
          {[
            { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
            { id: 'slides', icon: 'photo_library', label: 'Vitrin (Hero)' },
            { id: 'products', icon: 'inventory_2', label: 'Koleksiyon' },
            { id: 'import', icon: 'auto_fix_high', label: 'İçe Aktar (AI)' },
            { id: 'blog', icon: 'article', label: 'Blog' },
            { id: 'integrations', icon: 'hub', label: 'Entegrasyonlar' },
            { id: 'orders', icon: 'shopping_cart', label: 'Siparişler' },
            { id: 'about', icon: 'info', label: 'Hakkımızda' },
            { id: 'customers', icon: 'group', label: 'Koleksiyoncular' },
            { id: 'settings', icon: 'settings', label: 'Ayarlar' },
            ...(userRole === 'admin' ? [{ id: 'users', icon: 'manage_accounts', label: 'Kullanıcılar' }] : [])
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as AdminView);
                setInputPass('');
                setError('');
                setPassSuccess('');
                setIsEditing(false);
                setSelectedCustomer(null);
                setSelectedOrder(null);
              }}
              className={`flex items-center gap-2 xl:gap-4 px-4 py-3 xl:py-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeView === item.id ? 'bg-primary text-stone-950 shadow-lg shadow-primary/20' : 'text-stone-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden xl:block mt-auto p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-black uppercase text-stone-400 mb-2 italic">Hesap</p>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-stone-950 text-white flex items-center justify-center font-black text-xs">A</div>
            <div className="flex-1">
              <p className="text-xs font-bold truncate">{userRole === 'admin' ? 'Saray Nazırı' : 'İçerik Editörü'}</p>
              <button onClick={() => { localStorage.removeItem('asil_auth_token'); window.location.reload(); }} className="text-[9px] font-black text-primary uppercase hover:underline">Güvenli Çıkış</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};
