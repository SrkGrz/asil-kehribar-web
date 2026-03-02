
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Slide } from '../types';

interface HomeProps {
  onAddToCart: (product: Product) => void;
  favorites: Product[];
  onToggleFavorite: (product: Product) => void;
  products: Product[];
  slides: Slide[];
}

export const Home: React.FC<HomeProps> = ({ onAddToCart, favorites, onToggleFavorite, products, slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isFavorite = (id: string) => favorites.some(p => p.id === id);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return <div className="h-[75vh] bg-stone-50 flex items-center justify-center">No slides available</div>;
  }

  // Ensure currentSlide is bounds-checked (defensive programming against dynamic slide arrays)
  const safeSlideIndex = currentSlide % slides.length;
  const activeSlide = slides[safeSlideIndex];

  return (
    <div className="space-y-32">
      {/* Hero Slider Section */}
      <section className="px-4 md:px-8 mt-8">
        <div className="relative h-[75vh] w-full max-w-[1400px] mx-auto rounded-[3rem] flex items-center justify-center overflow-hidden bg-stone-50 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 z-0"
            >
              <img
                src={activeSlide?.image || undefined}
                className="w-full h-full object-cover opacity-40"
                alt={activeSlide?.title || 'Slide'}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/40 dark:to-transparent"></div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeSlideIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full border border-primary/40 text-[10px] font-black tracking-[0.5em] text-primary uppercase mb-8 backdrop-blur-sm">
                  {activeSlide?.tag}
                </span>
                <h1 className="font-display text-5xl md:text-8xl lg:text-9xl font-black text-stone-950 leading-tight mb-10 tracking-tight">
                  {activeSlide?.title?.split(' ').map((word, i) => (
                    word.toLowerCase() === 'amber' ? <span key={i} className="italic text-primary font-medium">Amber </span> : word + ' '
                  ))}
                </h1>
                <p className="text-xl md:text-2xl text-stone-600 italic font-display max-w-2xl mx-auto mb-14 leading-relaxed">
                  {activeSlide?.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/shop" className="bg-primary text-stone-950 px-12 py-5 font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-stone-950 hover:text-white hover:-translate-y-1 transition-all shadow-2xl shadow-primary/20">
                KOLEKSİYONU KEŞFET
              </Link>
              <Link to="/about" className="backdrop-blur-md bg-white/50 border border-stone-950/10 text-stone-950 px-12 py-5 font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-stone-950 hover:text-white transition-all">
                HAKKIMIZDA
              </Link>
            </div>

            {/* Slider Indicators */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1 transition-all duration-500 rounded-full ${safeSlideIndex === i ? 'w-12 bg-primary' : 'w-4 bg-stone-950/20'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="text-left">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Özel Seçki</span>
            <h2 className="font-display text-4xl font-black md:text-6xl text-stone-950 dark:text-white italic">Asil Tasarımlar</h2>
          </div>
          <Link to="/shop" className="text-[11px] font-black uppercase tracking-widest text-stone-400 hover:text-primary flex items-center gap-2 transition-colors">
            TÜM KOLEKSİYON <span className="material-symbols-outlined text-sm">east</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.slice(0, 3).map(product => (
            <div key={product.id} className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-50 dark:bg-stone-950 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-2xl">
              <img src={product.image || undefined} className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" alt={product.name} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(product);
                }}
                className={`absolute top-8 right-8 z-20 size-12 rounded-2xl flex items-center justify-center transition-all ${isFavorite(product.id) ? 'bg-primary text-stone-950' : 'bg-black/20 text-white backdrop-blur-xl hover:bg-white hover:text-stone-950'}`}
              >
                <span className={`material-symbols-outlined text-2xl ${isFavorite(product.id) ? 'fill-1' : ''}`}>
                  favorite
                </span>
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-10 flex flex-col justify-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Zanaatkar İşçilik</span>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-display text-3xl text-white font-bold mb-6 hover:text-primary transition-colors leading-tight italic">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white italic">₺{product.price.toLocaleString('tr-TR')}</span>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-950 bg-white px-5 py-3 rounded-xl hover:bg-primary transition-colors"
                  >
                    EKLE <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-stone-50 dark:bg-stone-900/20 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden relative border border-zinc-100 dark:border-zinc-800">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] border-2 border-primary rounded-full animate-pulse"></div>
          </div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-primary text-6xl mb-10">military_tech</span>
            <h2 className="text-4xl md:text-7xl font-display font-black text-stone-950 dark:text-white italic mb-8">Neden Asil Kehribar?</h2>
            <p className="max-w-2xl mx-auto text-stone-500 text-lg md:text-xl font-medium leading-relaxed mb-12">
              Piyasada bolca bulunan fabrikasyon ürünlerin aksine biz, her bir habbenin ruhuna dokunan, usta ellerde hayat bulan gerçek Baltık Kehribarı'nı asil sahipleriyle buluşturuyoruz.
            </p>
            <div className="grid md:grid-cols-3 gap-12 text-left mt-20">
              <div>
                <h4 className="text-primary font-black uppercase text-xs tracking-widest mb-4">01. Saf Kaynak</h4>
                <p className="text-stone-600 dark:text-stone-400 text-sm">Doğrudan Baltık Denizi'nin kadim yataklarından gelen en kaliteli hammaddeler.</p>
              </div>
              <div>
                <h4 className="text-primary font-black uppercase text-xs tracking-widest mb-4">02. El İşçiliği</h4>
                <p className="text-stone-600 dark:text-stone-400 text-sm">Torna başında sabahlayan ustalarımızın her habeler üzerindeki alın teri.</p>
              </div>
              <div>
                <h4 className="text-primary font-black uppercase text-xs tracking-widest mb-4">03. Asil Kayıt</h4>
                <p className="text-stone-600 dark:text-stone-400 text-sm">Her eser için verilen, ömür boyu orijinallik garantisi sunan özel sertifika.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
