
import React from 'react';
import { SiteSettings } from '../types';

interface AboutProps {
  settings: SiteSettings;
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=1600&q=80';
const CONTENT_IMAGE = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=80';
const TEAM_IMAGE = 'https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?w=900&q=80';

export const About: React.FC<AboutProps> = ({ settings }) => {
  const heroImage = settings.aboutHeroImage || HERO_IMAGE;
  const contentImage = settings.aboutContentImage || CONTENT_IMAGE;
  const title = settings.aboutTitle || 'Gerçek Kehribar<br/>Zarafeti';
  const text1 = settings.aboutText1 || 'Asil Kehribar, yüzyıllık usta geleneğini modern koleksiyonculukla buluşturan bir kavram. Her bir tane, Baltık Denizi\'nin kadim katmanlarından gelen saf hammaddeden, usta ellerin sabırlı işçiliğiyle şekillenir.';
  const text2 = settings.aboutText2 || 'Fabrikasyon ürünlerin kitlesel dünyasında biz farklı bir yol seçtik: hakikatin, özün ve kalıcılığın peşinde. Koleksiyonumuzdaki her eser, analiz edilmiş, sertifikalandırılmış ve size özel hazırlanmıştır.';
  const years = settings.aboutYears || '15+';
  const customers = settings.aboutCustomers || '2.000+';

  return (
    <div className="space-y-0 pb-32">

      {/* ─── HERO ─── */}
      <section className="px-4 md:px-8 mt-8">
        <div className="relative h-[75vh] w-full max-w-[1400px] mx-auto flex items-end overflow-hidden bg-stone-50 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <img
            src={heroImage}
            className="absolute inset-0 size-full object-cover"
            alt="Asil Kehribar - Hakkımızda"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 w-full pb-20">
            <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">
              Koleksiyoncu Arşivi · Kuruluş 2009
            </span>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-black text-white italic leading-none max-w-4xl tracking-tight">
              Asil Bir <br />Tutkunun <br />
              <span className="text-primary">Hikayesi.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="px-4 md:px-8">
        <div className="w-full max-w-[1400px] mx-auto bg-stone-950 border border-zinc-800 border-t-0 py-10">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: years, label: 'Yıllık Tecrübe' },
                { value: customers, label: 'Asil Koleksiyoncu' },
                { value: '100%', label: 'Orijinal & Sertifikalı' },
                { value: '7/24', label: 'Koleksiyoncu Desteği' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-4xl md:text-5xl font-display font-black italic text-primary mb-2">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HIKAYE ─── */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
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
            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex gap-12">
              <div>
                <p className="text-3xl font-black italic font-display text-primary">{years}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">Yıllık Tecrübe</p>
              </div>
              <div>
                <p className="text-3xl font-black italic font-display text-primary">{customers}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">Asil Koleksiyoncu</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="h-[75vh] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <img
                src={contentImage}
                referrerPolicy="no-referrer"
                className="size-full object-cover transition-all duration-700 group-hover:scale-105"
                alt="Kehribar İşçiliği"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white dark:bg-stone-900 p-8 hidden xl:block shadow-2xl border border-primary/20">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 block">workspace_premium</span>
              <p className="text-stone-950 dark:text-white font-display text-xl font-black italic leading-tight mb-1">Asil Mühürlü</p>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Sadece En Saf Kehribar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── USTA İŞÇİLİĞİ ─── */}
      <section className="bg-stone-50 dark:bg-stone-900/30 py-32 border-y border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 aspect-[4/3] overflow-hidden shadow-2xl">
              <img
                src={settings.craftsmanImage || TEAM_IMAGE}
                className="size-full object-cover"
                alt="Usta İşçiliği"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-10">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Zanaatkarlarımız</span>
              <h2 className="text-4xl md:text-5xl font-display font-black italic text-stone-950 dark:text-white leading-tight">
                {settings.craftsmanTitle || 'Ustanın Elinden Asil Sahibe.'}
              </h2>
              <div className="space-y-6 text-stone-600 dark:text-stone-400 leading-relaxed text-lg font-medium">
                <p>{settings.craftsmanText1 || 'Her tane, usta tornacıların onlarca yıllık birikiminin ürünüdür.'}</p>
                <p>{settings.craftsmanText2 || 'Osmanlı geleneğinden beslenip modern estetiğe kavuşan her eser.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4">
                {[
                  { icon: 'diamond', title: settings.craftsmanFeature1Title || 'El İşçiliği', desc: settings.craftsmanFeature1Desc || 'Her tane usta ellerde şekillenir' },
                  { icon: 'verified', title: settings.craftsmanFeature2Title || 'Lab Analizi', desc: settings.craftsmanFeature2Desc || 'Spektroskopi ile doğrulanmış' },
                  { icon: 'history_edu', title: settings.craftsmanFeature3Title || 'Osmanlı Mirası', desc: settings.craftsmanFeature3Desc || 'Asırlık gelenek, modern estetik' },
                  { icon: 'local_shipping', title: settings.craftsmanFeature4Title || 'Güvenli Teslimat', desc: settings.craftsmanFeature4Desc || 'Özel muhafaza kutusunda' },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">{f.icon}</span>
                    </div>
                    <div>
                      <p className="font-black text-sm text-stone-950 dark:text-white">{f.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
      <section className="bg-stone-950 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-6 block">military_tech</span>
          <h2 className="text-4xl md:text-6xl font-display font-black italic text-white mb-6">
            Asil Koleksiyonu <br />Keşfedin
          </h2>
          <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">
            Yüzyıllık usta geleneği ile buluşan nadir kehribar eserleri sizi bekliyor.
          </p>
          <a
            href="#/shop"
            className="inline-block bg-primary text-stone-950 font-black uppercase tracking-widest px-12 py-5 hover:bg-white transition-colors"
          >
            KOLEKSİYONU GÖR
          </a>
        </div>
      </section>

    </div>
  );
};
