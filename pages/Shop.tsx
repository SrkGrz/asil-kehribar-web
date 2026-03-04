
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface ShopProps {
  onAddToCart: (product: Product) => void;
  favorites: Product[];
  onToggleFavorite: (product: Product) => void;
  products: Product[];
  isLoading?: boolean;
}

export const Shop: React.FC<ShopProps> = ({ onAddToCart, favorites, onToggleFavorite, products, isLoading }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [activeType, setActiveType] = useState<string>('Tümü');
  const [sortBy, setSortBy] = useState<string>('default');
  const isFavorite = (id: string) => favorites.some(p => p.id === id);

  const filteredProducts = products
    .filter(p => {
      const matchesType = activeType === 'Tümü'
        ? p.type !== 'Koleksiyoner Ürünü'
        : p.type === activeType;
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.specs && p.specs.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* --- BREADCRUMB --- */}
      <nav className="flex items-center flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-6 overflow-hidden">
        <Link to="/" className="hover:text-primary transition-colors">ANASAYFA</Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span>TESPİH</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary italic">KEHRİBAR TESPİHLER</span>
      </nav>

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-black italic mb-4 text-stone-950 dark:text-white">
            {searchQuery ? `"${searchQuery}" için Sonuçlar` : 'Tüm Ürünler'}
          </h1>
          <p className="text-stone-500 max-w-2xl">
            {searchQuery
              ? `${filteredProducts.length} ürün bulundu.`
              : 'Damla, sıkma, ateş ve Osmanlı tarzı en özel kehribar tesbih modelleriyle ustalığın hikayesini keşfedin.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sıralama:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-100 dark:bg-stone-950 border-none rounded-xl py-2 pl-4 pr-10 text-xs font-bold focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="default">Önerilen</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="name-asc">İsim: A-Z</option>
            <option value="newest">En Yeniler</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">Kehribar Türü</h3>
            <div className="space-y-3">
              {['Tümü', ...Array.from(new Set(products.map(p => p.type)))].map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    checked={activeType === type}
                    onChange={() => setActiveType(type as any)}
                    className="size-4 text-primary border-zinc-300 dark:border-zinc-700 focus:ring-primary dark:bg-zinc-800"
                  />
                  <span className={`text-sm font-medium transition-colors ${activeType === type ? 'text-primary' : 'text-stone-600 dark:text-stone-400 group-hover:text-primary'}`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-stone-100 dark:bg-zinc-800 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-stone-100 dark:bg-zinc-800 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-stone-100 dark:bg-zinc-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="group bg-white dark:bg-stone-950 border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link to={`/product/${product.id}`} className="block size-full">
                      <img src={product.image || undefined} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                    </Link>
                    <button
                      onClick={() => onToggleFavorite(product)}
                      className={`absolute top-4 right-4 z-10 size-10 rounded-full flex items-center justify-center transition-all ${isFavorite(product.id) ? 'bg-primary text-stone-950 shadow-lg' : 'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md text-stone-950 dark:text-white hover:bg-primary hover:text-stone-950'}`}
                    >
                      <span className={`material-symbols-outlined text-xl ${isFavorite(product.id) ? 'fill-1' : ''}`}>
                        favorite
                      </span>
                    </button>
                    {product.isSpecial && (
                      <span className="absolute top-4 left-4 bg-primary text-stone-950 text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-lg">Usta İşi</span>
                    )}
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-stone-950 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-lg">Yeni</span>
                    )}
                  </div>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2 text-stone-950 dark:text-white leading-tight">{product.name}</h3>
                    </Link>
                    {product.specs && <p className="text-xs text-stone-500 mb-6">{product.specs}</p>}
                    <div className="flex items-center justify-between">
                      <div>
                        {product.originalPrice && (
                          <span className="block text-xs text-stone-400 line-through">₺{product.originalPrice.toLocaleString('tr-TR')}</span>
                        )}
                        <span className="text-lg font-black text-primary italic">₺{product.price.toLocaleString('tr-TR')}</span>
                      </div>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="size-9 rounded-full bg-primary text-stone-950 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-lg shadow-primary/30"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-50 dark:bg-stone-950/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-700 mb-4">search_off</span>
              <h3 className="text-xl font-bold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-stone-500">Aradığınız kriterlere uygun ürün bulunmamaktadır.</p>
              <button
                onClick={() => {
                  setActiveType('Tümü');
                  navigate('/shop');
                }}
                className="mt-6 px-8 py-3 bg-primary text-stone-950 font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
              >
                Tüm Ürünleri Gör
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
