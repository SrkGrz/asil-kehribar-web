
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface FavoritesProps {
  favorites: Product[];
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ favorites, onAddToCart, onToggleFavorite }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 min-h-[60vh]">
      <div className="mb-16">
        <h1 className="text-5xl font-display font-black italic mb-4 text-stone-950 dark:text-white text-center">Favorilerim</h1>
        <p className="text-stone-500 text-center max-w-xl mx-auto">Sizin için seçtiğimiz nadide parçalar arasından en beğendiklerinizi burada bulabilirsiniz.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-stone-950 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="size-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">favorite</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Henüz favori ürününüz yok.</h2>
          <Link 
            to="/shop" 
            className="inline-block bg-primary text-stone-950 px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform"
          >
            KOLEKSİYONU KEŞFET
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map(product => (
            <div key={product.id} className="group bg-white dark:bg-stone-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Link to={`/product/${product.id}`} className="block size-full">
                  <img src={product.image || undefined} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                </Link>
                <button 
                  onClick={() => onToggleFavorite(product)}
                  className="absolute top-4 right-4 z-10 size-10 rounded-full bg-primary text-stone-950 flex items-center justify-center shadow-lg"
                >
                  <span className="material-symbols-outlined text-xl fill-1">
                    favorite
                  </span>
                </button>
              </div>
              <div className="p-6">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1 text-stone-950 dark:text-white">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-black text-primary italic">₺{product.price.toLocaleString('tr-TR')}</span>
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="size-10 rounded-full bg-stone-950 dark:bg-zinc-100 text-white dark:text-stone-950 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
