
import React from 'react';
import { SiteSettings } from '../types';

interface AboutProps {
  settings: SiteSettings;
}

export const About: React.FC<AboutProps> = ({ settings }) => {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero */}
      <section className="relative h-[65vh] flex items-center overflow-hidden">
        <img 
          src={settings.aboutHeroImage} 
          className="absolute inset-0 size-full object-cover scale-110" 
          alt="Noble Amber History"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Koleksiyoncu Arşivi</span>
          <h1 className="text-6xl md:text-9xl font-display font-black text-stone-950 italic leading-none max-w-3xl tracking-tight">Asil Bir <br/> Tutkunun <br/> Hikayesi.</h1>
        </div>
      </section>

      {/* Content Block 1 */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <h2 className="text-4xl md:text-6xl font-display font-black italic text-stone-950 dark:text-white leading-tight" dangerouslySetInnerHTML={{ __html: settings.aboutTitle }}></h2>
            <div className="space-y-8 text-stone-600 dark:text-stone-400 leading-relaxed text-lg font-medium">
              <p>{settings.aboutText1}</p>
              <p>{settings.aboutText2}</p>
            </div>
            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex gap-12">
               <div>
                  <p className="text-3xl font-black italic font-display text-primary">{settings.aboutYears}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">Yıllık Tecrübe</p>
               </div>
               <div>
                  <p className="text-3xl font-black italic font-display text-primary">{settings.aboutCustomers}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">Asil Koleksiyoncu</p>
               </div>
            </div>
          </div>
          <div className="relative group">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <img src={settings.aboutContentImage} referrerPolicy="no-referrer" className="size-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" alt="Master Work" />
            </div>
            <div className="absolute -bottom-12 -right-12 bg-white p-12 rounded-3xl hidden xl:block shadow-3xl border border-primary/20 animate-in slide-in-from-right-10 duration-1000">
              <span className="material-symbols-outlined text-primary text-5xl mb-6">workspace_premium</span>
              <p className="text-stone-950 font-display text-2xl font-black italic leading-tight mb-2">Asil Mühürlü</p>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Sadece En Saf Kehribar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-stone-50 dark:bg-stone-900/20 py-32 border-y border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
           <div className="text-center mb-24">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Değerlerimiz</span>
              <h2 className="text-4xl md:text-6xl font-display font-black italic text-stone-950 dark:text-white">İnce Zevklerin <br/> Ortak Noktası</h2>
           </div>
           <div className="grid md:grid-cols-3 gap-16">
              {[
                { title: 'Orijinallik', desc: 'Sertifikasız ve analizi yapılmamış hiçbir ürünü asil koleksiyonumuza dahil etmiyoruz.' },
                { title: 'Estetik', desc: 'Her bir habbenin kesiminde altın oran ve estetik kusursuzluk temel ilkemizdir.' },
                { title: 'Güven', desc: 'Koleksiyoncularımızla olan ilişkimiz satışla bitmez; ömür boyu destekle başlar.' }
              ].map((item, idx) => (
                <div key={idx} className="text-center space-y-6">
                   <div className="size-16 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mx-auto flex items-center justify-center font-display font-black text-2xl italic text-primary">
                      {idx + 1}
                   </div>
                   <h3 className="text-2xl font-black italic font-display">{item.title}</h3>
                   <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};
