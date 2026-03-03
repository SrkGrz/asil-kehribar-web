
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface ProductDetailProps {
  onAddToCart: (product: Product) => void;
  favorites: Product[];
  onToggleFavorite: (product: Product) => void;
  products: Product[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ onAddToCart, favorites, onToggleFavorite, products }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const isFavorite = product ? favorites.some(p => p.id === product.id) : false;

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black mb-4">Ürün bulunamadı.</h2>
        <Link to="/shop" className="text-primary font-bold underline">Mağazaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Geri Dön
      </button>

      {/* --- BREADCRUMB --- */}
      <nav className="flex items-center flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-10 overflow-hidden">
        <Link to="/" className="hover:text-primary transition-colors shrink-0">ANASAYFA</Link>
        <span className="material-symbols-outlined text-[10px] shrink-0">chevron_right</span>
        <span className="shrink-0">TESPİH</span>
        <span className="material-symbols-outlined text-[10px] shrink-0">chevron_right</span>
        <Link to="/shop" className="hover:text-primary transition-colors shrink-0">KEHRİBAR TESPİHLER</Link>
        <span className="material-symbols-outlined text-[10px] shrink-0">chevron_right</span>
        <span className="text-primary truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Left: Images */}
        <div className="space-y-6">
          <div className="aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-stone-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">
            <img src={product.image || undefined} className="size-full object-cover" alt={product.name} />
            <button
              onClick={() => onToggleFavorite(product)}
              className={`absolute top-6 right-6 size-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isFavorite ? 'bg-primary text-stone-950' : 'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md text-stone-950 dark:text-white'}`}
            >
              <span className={`material-symbols-outlined text-2xl ${isFavorite ? 'fill-1' : ''}`}>
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">{product.type}</span>
            <h1 className="text-4xl md:text-5xl font-display font-black italic mb-4 text-stone-950 dark:text-white">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-primary italic">₺{product.price.toLocaleString('tr-TR')}</span>
              {product.originalPrice && (
                <span className="text-xl text-stone-400 line-through">₺{product.originalPrice.toLocaleString('tr-TR')}</span>
              )}
            </div>
          </div>

          <div className="space-y-8 mb-12 flex-1">
            {product.longDescription && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">Ürün Açıklaması</h3>
                <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                  {product.longDescription}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {product.size && (
                <div className="p-4 bg-zinc-50 dark:bg-stone-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Ölçü</p>
                  <p className="font-bold">{product.size}</p>
                </div>
              )}
              {product.specs && (
                <div className="p-4 bg-zinc-50 dark:bg-stone-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase text-stone-400 mb-1">Özellik</p>
                  <p className="font-bold">{product.specs.split('•')[0].trim()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-primary text-stone-950 font-black py-6 rounded-2xl text-lg hover:scale-[1.02] transition-transform shadow-2xl shadow-primary/30 flex items-center justify-center gap-4"
            >
              SEPETE EKLE
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-xs font-bold text-stone-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">verified</span>
              Sertifikalı Ürün
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">local_shipping</span>
              Ücretsiz Kargo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
