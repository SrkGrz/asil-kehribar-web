
import React from 'react';
import { Link } from 'react-router-dom';

export const Certificates: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24 space-y-32">
      {/* Hero Header */}
      <section className="text-center">
        <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Kayıt ve Tescil</span>
        <h1 className="text-5xl md:text-8xl font-display font-black italic mb-8 text-stone-950 dark:text-white leading-tight tracking-tight">Orijinalliğin <br/> Asil İmzası.</h1>
        <p className="max-w-3xl mx-auto text-stone-500 font-medium text-lg md:text-xl leading-relaxed">
          Asil Kehribar'dan edindiğiniz her eser, sadece bir obje değil; tescilli bir mirastır. Nadir parçalarımız, uluslararası standartlarda analiz edilmiş ve tescillenmiş olarak sizlere sunulur.
        </p>
      </section>

      {/* Trust Grid */}
      <section className="grid md:grid-cols-3 gap-12">
        {[
          { icon: 'verified', title: 'Analitik Tescil', desc: 'Her damla kehribar, laboratuvar ortamında kızıltesi (IR) spektroskopisi ile analiz edilerek orijinalliği onaylanır.' },
          { icon: 'token', title: 'Seri Numarası', desc: 'Ürünlerimiz, asil koleksiyon veri tabanımızda benzersiz bir takip numarası ile kayıt altındadır.' },
          { icon: 'draw', title: 'Usta Onayı', desc: 'İmzalı serilerimizde, zanaatkarın mührü ve torna karakteristikleri belgelenerek tescil edilir.' }
        ].map((item, idx) => (
          <div key={idx} className="p-12 rounded-[2rem] bg-zinc-50 dark:bg-stone-950 border border-zinc-100 dark:border-zinc-800 group hover:bg-stone-950 dark:hover:bg-primary transition-all duration-500">
            <span className="material-symbols-outlined text-primary group-hover:text-white dark:group-hover:text-stone-950 text-6xl mb-8 transition-colors">{item.icon}</span>
            <h3 className="text-2xl font-black italic mb-4 group-hover:text-white dark:group-hover:text-stone-950 transition-colors">{item.title}</h3>
            <p className="text-stone-500 group-hover:text-stone-300 dark:group-hover:text-stone-950/70 text-sm leading-relaxed transition-colors">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Detailed Section */}
      <section className="grid lg:grid-cols-2 gap-24 items-center">
        <div className="relative">
          <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-3xl bg-white dark:bg-stone-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-8">
             <div className="size-full flex flex-col items-center justify-center p-10 text-center border-2 border-primary/20 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                <div className="absolute -top-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl"></div>
                
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-stone-400 mb-8 italic">Fine Amber Collection Registry</span>
                <div className="size-20 rounded-2xl bg-stone-950 text-primary flex items-center justify-center mb-8 shadow-xl">
                   <span className="material-symbols-outlined text-4xl">verified_user</span>
                </div>
                <h4 className="font-display text-4xl font-black italic mb-2 tracking-tight">Asil Kehribar</h4>
                <p className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-10">Official Certificate of Authenticity</p>
                
                <div className="w-full flex justify-between items-center px-4 mb-10">
                   <div className="text-left">
                      <p className="text-[8px] font-black uppercase text-stone-400 tracking-tighter">Register No</p>
                      <p className="text-sm font-black italic">AK-2024-0892</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black uppercase text-stone-400 tracking-tighter">Issue Date</p>
                      <p className="text-sm font-black italic">22.05.2024</p>
                   </div>
                </div>

                <p className="text-xs text-stone-400 italic font-medium leading-relaxed max-w-sm mb-10">
                  "Bu belge, ürünün nadir Baltık kehribarından işlendiğini ve %100 saf olduğunu 
                  Asil Kehribar kalite standartları çerçevesinde garanti eder."
                </p>
                
                <div className="flex gap-10 opacity-30">
                   <span className="material-symbols-outlined">seal</span>
                   <span className="material-symbols-outlined">security</span>
                   <span className="material-symbols-outlined">approval</span>
                </div>
             </div>
          </div>
          <div className="absolute -bottom-10 -left-10 bg-stone-950 text-white p-10 rounded-3xl shadow-3xl max-w-[280px] border border-primary/20">
            <p className="text-sm font-black italic leading-tight">Dijital ve ıslak imzalı tescil belgesi, ürünle birlikte özel muhafazasında sunulur.</p>
          </div>
        </div>
        
        <div className="space-y-12">
          <h2 className="text-4xl md:text-6xl font-display font-black italic leading-tight">Tescil Belgesinin <br/> Avantajları</h2>
          <div className="space-y-10">
            {[
              { label: 'Geri Alım Garantisi', val: 'Tescilli ürünlerimiz için pazar değerinde geri alım önceliği sunuyoruz.' },
              { label: 'Yatırım Değeri', val: 'Sertifikalı kehribar, zamanla değeri artan nadir bir emtia niteliği taşır.' },
              { label: 'Koleksiyon Kaydı', val: 'Ürününüzün hikayesi ve teknik özellikleri saray arşivimizde dijital olarak saklanır.' },
              { label: 'Uluslararası Geçerlilik', val: 'Analiz raporlarımız küresel koleksiyoncu camiasında kabul gören standartlardadır.' }
            ].map((info, idx) => (
              <div key={idx} className="flex items-start gap-6 group">
                <div className="size-3 bg-primary rounded-full mt-2.5 transition-transform group-hover:scale-150"></div>
                <div>
                  <h4 className="font-black text-xl italic font-display">{info.label}</h4>
                  <p className="text-stone-500 text-sm mt-1 leading-relaxed">{info.val}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/shop" className="inline-flex items-center gap-4 bg-stone-950 dark:bg-white text-primary dark:text-stone-950 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">
             ASİL KOLEKSİYONU KEŞFET
             <span className="material-symbols-outlined">arrow_right_alt</span>
          </Link>
        </div>
      </section>

      {/* Security Check */}
      <section className="bg-stone-950 dark:bg-stone-950 p-16 md:p-24 rounded-[4rem] text-center border border-primary/10">
        <h2 className="text-4xl md:text-7xl font-display font-black italic mb-10 text-white tracking-tight">Güvenle <br/> Koleksiyon Yapın</h2>
        <p className="max-w-3xl mx-auto text-stone-400 mb-16 text-lg md:text-xl leading-relaxed">
          Piyasadaki şaibeli ürünlerden uzaklaşın. Asil Kehribar olarak, her bir habbenin milyonlarca yıllık yolculuğuna tanıklık ediyor ve bunu belgeliyoruz.
        </p>
        <div className="flex flex-wrap justify-center gap-8">
           <div className="px-10 py-5 bg-white/5 rounded-2xl border border-white/10 font-black text-[10px] text-white uppercase tracking-[0.3em] flex items-center gap-4">
             <span className="material-symbols-outlined text-primary">verified</span>
             Gerçek Baltık Onayı
           </div>
           <div className="px-10 py-5 bg-white/5 rounded-2xl border border-white/10 font-black text-[10px] text-white uppercase tracking-[0.3em] flex items-center gap-4">
             <span className="material-symbols-outlined text-primary">history_edu</span>
             Ömür Boyu Garanti
           </div>
        </div>
      </section>
    </div>
  );
};
