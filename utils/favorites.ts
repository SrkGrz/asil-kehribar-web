import { Product } from '../types';

export const isProductFavorite = (favorites: Product[], id: string) => favorites.some(p => p.id === id);
