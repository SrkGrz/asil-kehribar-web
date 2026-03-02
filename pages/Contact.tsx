
import React, { useState } from 'react';
import { SiteSettings } from '../types';

interface ContactProps {
  settings: SiteSettings;
}

export const Contact: React.FC<ContactProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('sending');
    
    // Form gönderim simülasyonu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="size-24 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center mb-8 animate-bounce">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black italic mb-6">Mesajınız Alındı!</h1>
        <p className="text-xl text-stone-500 max-w-xl mx-auto mb-12">
          Değerli vaktinizi ayırdığınız için teşekkür ederiz. Ustalarımız mesajınızı inceleyip en kısa sürede size dönüş yapacaktır.
        </p>
        <button 
          onClick={() => { setStatus('idle'); setFormData({ name: '', email: '', message: '' }); }}
          className="bg-stone-950 dark:bg-zinc-100 text-white dark:text-stone-950 px-10 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
        >
          YENİ MESAJ GÖNDER
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24">
      <div className="mb-20">
        <h1 className="text-5xl md:text-8xl font-display font-black italic mb-6">İletişime Geçin</h1>
        <p className="text-xl text-stone-500 font-light max-w-2xl leading-relaxed">Amber ustalığının mirasını deneyimleyin. Özel bir talebiniz varsa veya İstanbul'daki atölyemizi ziyaret etmek isterseniz yardıma hazırız.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-5 space-y-12">
          {[
            { icon: 'mail', title: 'E-posta', val: settings.email },
            { icon: 'call', title: 'Telefon', val: settings.phone, sub: 'Pzt-Cmt, 09:00 - 18:00' },
            { icon: 'location_on', title: 'Atölye', val: settings.address }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="size-14 rounded-full border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-stone-950 transition-all duration-500">
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">{item.title}</h3>
                <p className="text-xl font-bold italic font-display">{item.val}</p>
                {item.sub && <p className="text-sm text-stone-500 mt-1">{item.sub}</p>}
              </div>
            </div>
          ))}

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Bizi Takip Edin</h3>
            <div className="flex gap-4">
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary hover:text-primary transition-all group">
                <svg className="size-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span className="text-sm font-bold">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-zinc-50 dark:bg-stone-950 p-10 lg:p-14 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ad Soyad</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-primary px-0 py-4 text-xl font-display font-bold italic" 
                  placeholder="İsim Girin" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">E-posta</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-primary px-0 py-4 text-xl font-display font-bold italic" 
                  placeholder="E-posta Girin" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Mesajınız</label>
              <textarea 
                rows={4} 
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-700 focus:ring-0 focus:border-primary px-0 py-4 text-xl font-display font-bold italic resize-none" 
                placeholder="Size nasıl yardımcı olabiliriz?"
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-primary text-stone-950 font-black py-6 rounded-xl text-lg uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? (
                <>
                  <div className="size-5 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin"></div>
                  GÖNDERİLİYOR...
                </>
              ) : (
                <>
                  MESAJ GÖNDER
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
