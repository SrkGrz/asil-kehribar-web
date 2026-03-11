
import React from 'react';
import { SiteSettings } from '../types';

interface AboutProps {
  settings: SiteSettings;
}


export const About: React.FC<AboutProps> = ({ settings }) => {
  const title = settings.aboutTitle || 'Gerçek Kehribar<br/>Zarafeti';
  const text1 = settings.aboutText1 || 'Asil Kehribar, yüzyıllık usta geleneğini modern koleksiyonculukla buluşturan bir kavram. Her bir tane, Baltık Denizi\'nin kadim katmanlarından gelen saf hammaddeden, usta ellerin sabırlı işçiliğiyle şekillenir.';
  const text2 = settings.aboutText2 || 'Fabrikasyon ürünlerin kitlesel dünyasında biz farklı bir yol seçtik: hakikatin, özün ve kalıcılığın peşinde. Koleksiyonumuzdaki her eser, analiz edilmiş, sertifikalandırılmış ve size özel hazırlanmıştır.';


  return (
    <div className="space-y-0 pb-32">

      {/* ─── HERO ─── */}
      <section className="px-4 md:px-8 mt-8">
        <div className="relative py-32 w-full max-w-[1400px] mx-auto flex items-center justify-center bg-stone-50 border border-zinc-200 shadow-sm text-center">
          <div className="relative z-10 max-w-4xl mx-auto px-4 w-full">
            <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">
              Koleksiyoncu Arşivi · Kuruluş 2009
            </span>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-black text-stone-950 italic leading-tight tracking-tight">
              Asil Bir <br />Tutkunun <br />
              <span className="text-primary">Hikayesi.</span>
            </h1>
          </div>
        </div>
      </section>


      {/* ─── HIKAYE ─── */}
      <section className="max-w-4xl mx-auto px-4 py-32 text-center">
        <div className="space-y-10">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Hikayemiz</span>
          <h2
            className="text-4xl md:text-6xl font-display font-black italic text-stone-950 dark:text-white leading-tight"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div className="space-y-6 text-stone-600 dark:text-stone-400 leading-relaxed text-lg font-medium">
            <p>{text1}</p>
            <p>{text2}</p>
          </div>
        </div>
      </section>


      {/* ─── DEĞERLERİMİZ ─── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Değerlerimiz</span>
            <h2 className="text-4xl md:text-6xl font-display font-black italic text-stone-950 dark:text-white">
              İnce Zevklerin <br />Ortak Noktası
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                num: '01',
                icon: 'verified_user',
                title: 'Orijinallik',
                desc: 'Sertifikasız ve labaratuvar analizi yapılmamış hiçbir ürünü asil koleksiyonumuza dahil etmiyoruz. Her taşın kimliği belgelenmiştir.',
              },
              {
                num: '02',
                icon: 'auto_fix_high',
                title: 'Estetik',
                desc: 'Her bir habbenin kesiminde altın oran ve estetik kusursuzluk temel ilkemizdir. Renk, parlaklık ve form tek tek değerlendirilir.',
              },
              {
                num: '03',
                icon: 'handshake',
                title: 'Güven',
                desc: 'Koleksiyoncularımızla olan ilişkimiz satışla bitmez; ömür boyu destekle başlar. Asil bir eser asil bir dostluk gerektirir.',
              },
            ].map((item) => (
              <div key={item.num} className="group bg-white dark:bg-stone-950 p-10 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-5xl font-display font-black italic text-zinc-100 dark:text-zinc-800 select-none">{item.num}</span>
                  <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-stone-950 transition-all">
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black italic font-display mb-4 text-stone-950 dark:text-white">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-stone-50 py-24 mb-16 rounded-3xl mx-4 md:mx-8 border border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-6 block">military_tech</span>
          <h2 className="text-4xl md:text-6xl font-display font-black italic text-stone-950 mb-6">
            Asil Koleksiyonu <br />Keşfedin
          </h2>
          <p className="text-stone-600 text-lg mb-10 max-w-xl mx-auto">
            Yüzyıllık usta geleneği ile buluşan nadir kehribar eserleri sizi bekliyor.
          </p>
          <a
            href="#/shop"
            className="inline-block bg-primary text-stone-950 font-black uppercase tracking-widest px-12 py-5 hover:bg-stone-950 hover:text-white transition-colors rounded-xl"
          >
            KOLEKSİYONU GÖR
          </a>
        </div>
      </section>

    </div>
  );
};
