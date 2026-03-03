
import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { fetchApi } from '../api';
import { useNavigate } from 'react-router-dom';

interface CheckoutProps {
  cart: CartItem[];
  onRemove: (id: string) => void;
  clearCart: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cart, onRemove, clearCart }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Sepetiniz boş.');
    if (!customer.fullName || !customer.email || !customer.phone || !customer.address) {
      return alert('Lütfen tüm teslimat bilgilerini doldurun.');
    }

    setIsSubmitting(true);
    try {
      const orderData: Partial<Order> = {
        customer,
        items: cart,
        subtotal,
        total: subtotal,
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      const result = await fetchApi('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      setOrderId(result.id);
      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      alert('Sipariş oluşturulamadı: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="size-24 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20 animate-bounce">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h1 className="text-4xl font-display font-black italic mb-4 text-stone-950 dark:text-white">Siparişiniz Alındı!</h1>
        <p className="text-stone-500 mb-8 max-w-md mx-auto">
          Sayın <strong>{customer.fullName}</strong>, koleksiyonumuzun nadide parçaları sizin için hazırlanmaya başladı. Sipariş numaranız: <span className="text-primary font-black italic">#{orderId}</span>
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-10 py-4 bg-primary text-stone-950 font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
        >
          MAĞAZAYA DÖN
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-black italic mb-12 text-stone-950 dark:text-white leading-none">
        Güvenli <span className="text-primary">Ödeme</span>
      </h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white dark:bg-stone-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-stone-950 shadow-lg shadow-primary/20">1</div>
              <h2 className="text-2xl font-black italic">Teslimat Bilgileri</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-stone-500 uppercase tracking-widest text-[10px]">Ad Soyad</label>
                <input
                  type="text"
                  value={customer.fullName}
                  onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-4 focus:ring-2 focus:ring-primary font-bold"
                  placeholder="Mehmet Yılmaz"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-stone-500 uppercase tracking-widest text-[10px]">E-posta</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={e => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-4 focus:ring-2 focus:ring-primary font-bold"
                  placeholder="mehmet@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-stone-500 uppercase tracking-widest text-[10px]">Telefon</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-4 focus:ring-2 focus:ring-primary font-bold"
                  placeholder="+90 5XX XXX XX XX"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-stone-500 uppercase tracking-widest text-[10px]">Adres</label>
                <textarea
                  rows={3}
                  value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-4 focus:ring-2 focus:ring-primary font-bold"
                  placeholder="Mahalle, sokak, bina ve kapı no..."
                  required
                ></textarea>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-stone-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-stone-950 shadow-lg shadow-primary/20">2</div>
              <h2 className="text-2xl font-black italic">Ödeme Yöntemi</h2>
            </div>
            <div className="space-y-6">
              <div className="p-6 border-2 border-primary bg-primary/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary text-3xl">credit_card</span>
                  <div>
                    <span className="font-black block text-sm italic">Kredi veya Banka Kartı</span>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">İşleminiz SSL ile şifrelenmektedir</span>
                  </div>
                </div>
                <div className="flex gap-2 grayscale opacity-50">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2.5" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 opacity-30 pointer-events-none select-none">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Kart Numarası</label>
                  <div className="relative">
                    <input type="text" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-4 font-bold" placeholder="TEST KARTI: 4242 ... ..." readOnly />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">lock</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Son Kullanma</label>
                  <input type="text" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-4 font-bold" placeholder="12/28" readOnly />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">CVV</label>
                  <input type="password" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-4 font-bold" placeholder="***" readOnly />
                </div>
              </div>
              <p className="text-[9px] text-primary font-black uppercase tracking-widest text-center italic">* ŞU ANDA TEST MODUNDASINIZ. ÖDEME YAP'A BASINCA SİPARİŞ OLUŞTURULACAKTIR.</p>
            </div>

            <div className="mt-10 p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                <div>
                  <h4 className="text-sm font-black italic mb-2">Güvenliğiniz Önceliğimizdir</h4>
                  <p className="text-xs text-stone-500 leading-relaxed font-medium">
                    Kart bilgileriniz hiçbir şekilde sistemlerimizde saklanmaz. Ödemeniz doğrudan banka altyapısı üzerinden <strong>256-Bit SSL şifreleme</strong> ve <strong>3D Secure</strong> korumasıyla gerçekleştirilir.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5 sticky top-28">
          <div className="bg-stone-950 text-white rounded-3xl overflow-hidden shadow-3xl border border-primary/10">
            <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-black italic tracking-tight">Sipariş Özeti</h3>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">Kayıtlı İşlem</span>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <img src={item.image || undefined} className="size-16 object-cover rounded-xl border border-white/10 group-hover:border-primary/50 transition-colors" alt={item.name} />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-stone-500 mt-1 uppercase font-bold tracking-widest">{item.type}</p>
                      <p className="text-sm font-black text-primary mt-2 italic">₺{(item.price * item.quantity).toLocaleString('tr-TR')}</p>
                    </div>
                    <button type="button" onClick={() => onRemove(item.id)} className="text-white/20 hover:text-red-500 transition-colors self-start">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="text-center py-10 opacity-40">
                    <span className="material-symbols-outlined text-4xl mb-2">shopping_basket</span>
                    <p className="text-xs font-bold uppercase tracking-widest">Sepetiniz Boş</p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="opacity-50">Ürün Toplamı</span>
                  <span>₺{subtotal.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="opacity-50">Lojistik / Sigorta</span>
                  <span className="text-primary tracking-tighter italic">ÜCRETSİZ</span>
                </div>
                <div className="flex justify-between items-end pt-6 border-t border-white/5">
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Ödenecek Tutar</span>
                  <span className="text-4xl font-black text-primary italic leading-none">₺{subtotal.toLocaleString('tr-TR')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-primary text-stone-950 font-black py-6 rounded-2xl text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-spin material-symbols-outlined">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                )}
                {isSubmitting ? 'İŞLENİYOR...' : 'GÜVENLİ ÖDEME YAP'}
              </button>

              <div className="flex items-center justify-center gap-4 opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2.5" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                <div className="w-px h-4 bg-white/20"></div>
                <span className="text-[8px] font-black uppercase tracking-widest">Secure Checkout</span>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};
