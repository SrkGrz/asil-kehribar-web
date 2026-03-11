
import React, { useState, useEffect } from 'react';
import { MOCK_ORDERS, MOCK_CUSTOMERS } from '../constants';
import { fetchApi } from '../api';
import { Product, Slide, SiteSettings, BlogPost, Order } from '../types';
type AdminView = 'dashboard' | 'products' | 'orders' | 'customers' | 'settings' | 'integrations' | 'slides' | 'blog' | 'users' | 'about';

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
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const Admin: React.FC<AdminProps> = ({ products, setProducts, slides, setSlides, settings, setSettings, blogPosts, setBlogPosts, orders, setOrders }) => {
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

  // Automatic Logout System (1 Minute)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      if (isAdminAuthenticated) {
        timeout = setTimeout(() => {
          handleLogout();
        }, 60000); // 60 seconds (1 minute)
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('asil_auth_token');
      setIsAdminAuthenticated(false);
      setAuthUser(null);
      setUserRole(null);
      alert("Oturumunuz hareketsizlikten dolayı 1 dakika sonra otomatik olarak sonlandırılmıştır.");
    };

    if (isAdminAuthenticated) {
      // Mouse move, click, or key press resets the timer
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('mousedown', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('touchstart', resetTimer);

      resetTimer(); // Start the timer
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isAdminAuthenticated]);

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
    image: '',
    stock: 0
  });

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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (result: string | string[]) => void, isMultiple: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const processFile = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
          alert(`Geçersiz dosya: ${file.name}. Lütfen sadece resim yükleyin.`);
          resolve('');
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
              resolve(canvas.toDataURL('image/jpeg', 0.82));
            } else {
              resolve(reader.result as string);
            }
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    if (isMultiple) {
      Promise.all(Array.from(files).map(processFile)).then((results) => {
        const validResults = results.filter(r => r !== '');
        if (validResults.length > 0) callback(validResults);
      });
    } else {
      processFile(files[0]).then((result) => {
        if (result) callback(result);
      });
    }
    e.target.value = '';
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

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const updatedOrder = await fetchApi(`/api/orders/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      alert('Sipariş durumu güncellenemedi: ' + err.message);
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
                { label: 'Toplam Gelir', value: `₺${orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0).toLocaleString('tr-TR')}`, icon: 'payments', color: 'bg-indigo-500' },
                { label: 'Aktif Sipariş', value: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length, icon: 'shopping_basket', color: 'bg-emerald-500' },
                { label: 'Koleksiyoncu', value: new Set(orders.map(o => o.customer.email)).size, icon: 'group', color: 'bg-blue-500' },
                { label: 'Toplam Eser', value: products.length, icon: 'inventory_2', color: 'bg-amber-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:scale-105 transition-transform">
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 ${stat.color} opacity-5 rounded-full`}></div>
                  <div className="relative z-10">
                    <div className={`size-12 rounded-2xl ${stat.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-500/20 shadow-${stat.color.split('-')[1]}`}>
                      <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{stat.label}</p>
                    <p className="text-4xl font-display font-black italic text-stone-950 dark:text-white leading-none">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stock Alerts */}
            {products.filter(p => (p.stock || 0) < 5).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-8 rounded-3xl animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">warning</span>
                  </div>
                  <div>
                    <h3 className="font-black italic text-xl text-red-900 dark:text-red-400">Kritik Stok Uyarıları</h3>
                    <p className="text-sm text-red-700 dark:text-red-500/70">Aşağıdaki eserlerin mevcudu tükenmek üzere!</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.filter(p => (p.stock || 0) < 5).map(p => (
                    <div key={p.id} className="bg-white dark:bg-stone-900 p-4 rounded-2xl flex items-center justify-between border border-red-100 dark:border-red-900/20">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="size-10 rounded-lg object-cover" alt="" />
                        <span className="font-bold text-sm line-clamp-1">{p.name}</span>
                      </div>
                      <span className="font-black text-red-600">{(p.stock || 0)} Adet</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setActiveView('orders'); }}>
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400">
                                <span className="material-symbols-outlined text-sm">inventory</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm line-clamp-1">{order.customer.fullName}</p>
                                <p className="text-[10px] text-stone-400">{order.id} • {order.date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <p className="font-black text-primary italic text-sm">₺{order.total.toLocaleString('tr-TR')}</p>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${order.status === 'pending' ? 'bg-amber-100/10 text-amber-500' :
                              order.status === 'delivered' ? 'bg-green-100/10 text-green-500' :
                                'bg-zinc-100 dark:bg-zinc-800 text-stone-400'
                              }`}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-12 text-center text-stone-400 italic text-sm">Henüz sipariş bulunmuyor.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-stone-400 mb-6 tracking-widest">Hızlı Erişim</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setEditingProduct({ name: '', price: 0, description: '', longDescription: '', specs: '', size: '', color: '', type: '', image: '' }); setIsEditing(true); setActiveView('products'); }} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
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
                              {Array.from(new Set(products.map(p => p.type))).map(t => <option key={t} value={t} />)}
                            </datalist>
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-2">Stok Miktarı</label>
                          <input
                            type="number"
                            value={editingProduct.stock}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 font-bold text-amber-600"
                          />
                        </div>
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
                      {/* Main Image View */}
                      <div className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                        <img src={editingProduct.image || undefined} className="size-full object-cover" alt="Main" />
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                          <span className="material-symbols-outlined text-4xl mb-2">change_circle</span>
                          <span className="text-[10px] font-black uppercase">Ana Resmi Değiştir</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, (res) => setEditingProduct({ ...editingProduct, image: Array.isArray(res) ? res[0] : res }))}
                          />
                        </label>
                      </div>

                      {/* Multi Image List */}
                      <div className="grid grid-cols-4 gap-2">
                        {editingProduct.images?.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-zinc-200 dark:border-zinc-700">
                            <img src={img} className="size-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingProduct({ ...editingProduct, image: img })}
                                className="size-6 rounded-full bg-primary text-stone-950 flex items-center justify-center"
                                title="Ana Resim Yap"
                              >
                                <span className="material-symbols-outlined text-xs">star</span>
                              </button>
                              <button
                                onClick={() => setEditingProduct({ ...editingProduct, images: editingProduct.images?.filter((_, i) => i !== idx) })}
                                className="size-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                                title="Sil"
                              >
                                <span className="material-symbols-outlined text-xs">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors group">
                          <span className="material-symbols-outlined text-stone-300 group-hover:text-primary">add_photo_alternate</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, (res) => {
                              const newImages = Array.isArray(res) ? res : [res];
                              setEditingProduct(prev => ({
                                ...prev,
                                images: [...(prev.images || []), ...newImages].filter(Boolean)
                              }));
                            }, true)}
                          />
                        </label>
                      </div>

                      <div className="pt-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Harici Görsel URL Ekle</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const url = (e.target as HTMLInputElement).value;
                                if (url) {
                                  setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), url], image: prev.image || url }));
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            className="flex-1 bg-zinc-50 dark:bg-stone-50 border-none rounded-xl p-4 font-bold text-stone-950"
                            placeholder="https://... + Enter"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-stone-400 text-center italic">Birden fazla resim ekleyebilirsiniz. Yıldız butonu ile ana görseli seçebilirsiniz.</p>
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
                  setEditingProduct({ name: '', price: 0, description: '', longDescription: '', specs: '', size: '', color: '', type: 'Diğer', image: '', stock: 1 });
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
                    <th className="p-6 text-[10px] font-black uppercase text-stone-500 tracking-widest">Stok</th>
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
                      <td className="p-6">
                        <span className={`font-black text-sm ${(product.stock || 0) < 5 ? 'text-red-500' : 'text-stone-400'}`}>
                          {product.stock || 0} Adet
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
                    <p className="font-bold text-lg mb-1">{selectedOrder.customer.fullName}</p>
                    <p className="text-sm text-stone-500 mb-4">{selectedOrder.customer.email}</p>
                    <p className="text-sm font-bold mb-4">{selectedOrder.customer.phone}</p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {selectedOrder.customer.address}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-stone-400 mb-4 tracking-widest">Ödeme Özeti</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Ara Toplam</span>
                        <span className="font-bold">₺{selectedOrder.subtotal.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Kargo</span>
                        <span className="font-bold text-green-600">Ücretsiz</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-lg">
                        <span className="font-black italic">Toplam</span>
                        <span className="font-black italic text-primary">₺{selectedOrder.total.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-[10px] font-black uppercase text-stone-400 mb-6 tracking-widest">Sipariş İçeriği</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div className="size-16 rounded-xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <img src={item.image || "https://picsum.photos/seed/amber1/200/200"} className="size-full object-cover" alt="" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-[10px] text-stone-400 uppercase font-black">{item.type} • {item.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary italic text-sm">₺{item.price.toLocaleString('tr-TR')}</p>
                          <p className="text-[10px] text-stone-400 font-bold">{item.quantity} Adet</p>
                        </div>
                      </div>
                    ))}
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
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-6 font-bold text-sm">{order.id}</td>
                      <td className="p-6 text-sm font-medium">{order.customer.fullName}</td>
                      <td className="p-6 text-sm opacity-60">{order.date}</td>
                      <td className="p-6 font-black text-primary italic text-sm">₺{order.total.toLocaleString('tr-TR')}</td>
                      <td className="p-6">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer focus:ring-2 focus:ring-primary ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                            }`}
                        >
                          <option value="pending">BEKLEMEDE</option>
                          <option value="preparing">HAZIRLANIYOR</option>
                          <option value="shipped">KARGOLANDI</option>
                          <option value="delivered">TESLİM EDİLDİ</option>
                          <option value="cancelled">İPTAL</option>
                        </select>
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
          </div >
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
                        onChange={(e) => handleFileChange(e, (res) => setEditingSlide({ ...editingSlide, image: Array.isArray(res) ? res[0] : res }))}
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
                        onChange={(e) => handleFileChange(e, (res) => setEditingBlogPost({ ...editingBlogPost, image: Array.isArray(res) ? res[0] : res }))}
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
