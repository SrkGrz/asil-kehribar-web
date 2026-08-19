import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Favorites } from '../pages/Favorites';
import { Product } from '../types';
import { product } from './fixtures';

const FAVORITES = [
    product({ id: '1', name: 'Baltık Damla Tesbih', price: 4250 }),
    product({ id: '2', name: 'Ateş Kehribar Tesbih', price: 1850 })
];

const renderFavorites = ({ favorites = FAVORITES as Product[], onAddToCart = vi.fn(), onToggleFavorite = vi.fn() } = {}) => {
    const utils = render(
        <MemoryRouter>
            <Favorites favorites={favorites} onAddToCart={onAddToCart} onToggleFavorite={onToggleFavorite} />
        </MemoryRouter>
    );
    return { ...utils, onAddToCart, onToggleFavorite };
};

describe('Favorites', () => {
    it('lists every favorite with its price and product link', () => {
        renderFavorites();

        expect(screen.getByRole('heading', { name: 'Baltık Damla Tesbih' })).toBeInTheDocument();
        expect(screen.getByText('₺4.250')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Ateş Kehribar Tesbih' })).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'Ateş Kehribar Tesbih' })[0]).toHaveAttribute('href', '/product/2');
    });

    it('shows the empty state with a shop link when there are no favorites', () => {
        renderFavorites({ favorites: [] });

        expect(screen.getByText('Henüz favori ürününüz yok.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'KOLEKSİYONU KEŞFET' })).toHaveAttribute('href', '/shop');
        expect(screen.queryByRole('heading', { name: /Tesbih/ })).not.toBeInTheDocument();
    });

    it('forwards add to cart and un-favorite clicks for the right product', () => {
        const { onAddToCart, onToggleFavorite } = renderFavorites();

        fireEvent.click(screen.getAllByText('add_shopping_cart')[1]);
        fireEvent.click(screen.getAllByText('favorite')[0]);

        expect(onAddToCart).toHaveBeenCalledWith(FAVORITES[1]);
        expect(onToggleFavorite).toHaveBeenCalledWith(FAVORITES[0]);
    });
});
