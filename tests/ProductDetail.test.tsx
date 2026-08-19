import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetail } from '../pages/ProductDetail';
import { Product } from '../types';
import { product } from './fixtures';

const PRODUCT = product({
    id: '1',
    name: 'Baltık Damla Tesbih',
    price: 4250,
    originalPrice: 5000,
    specs: 'Gümüş Kamçı • 9x13mm Arpa Kesim',
    image: 'https://example.com/main.jpg',
    images: ['https://example.com/main.jpg', 'https://example.com/second.jpg']
});

const renderDetail = (
    { id = '1', products = [PRODUCT], isLoading = false, favorites = [] as Product[], onAddToCart = vi.fn(), onToggleFavorite = vi.fn() } = {}
) => {
    const utils = render(
        <MemoryRouter initialEntries={[`/product/${id}`]}>
            <Routes>
                <Route
                    path="/product/:id"
                    element={
                        <ProductDetail
                            products={products}
                            isLoading={isLoading}
                            favorites={favorites}
                            onAddToCart={onAddToCart}
                            onToggleFavorite={onToggleFavorite}
                        />
                    }
                />
            </Routes>
        </MemoryRouter>
    );
    return { ...utils, onAddToCart, onToggleFavorite };
};

describe('ProductDetail', () => {
    it('renders the product matching the route id', () => {
        renderDetail();

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Baltık Damla Tesbih');
        expect(screen.getByText('₺4.250')).toBeInTheDocument();
        expect(screen.getByText('₺5.000')).toBeInTheDocument();
        expect(screen.getByText('Uzun açıklama')).toBeInTheDocument();
    });

    it('shows only the first spec segment in the specs box', () => {
        renderDetail();

        expect(screen.getByText('Gümüş Kamçı')).toBeInTheDocument();
        expect(screen.getByText('9x13mm')).toBeInTheDocument();
    });

    it('shows a not found notice for an unknown id', () => {
        renderDetail({ id: '404' });

        expect(screen.getByText('Ürün bulunamadı.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Mağazaya Dön' })).toHaveAttribute('href', '/shop');
    });

    it('shows skeletons while loading, even before products arrive', () => {
        renderDetail({ products: [], isLoading: true });

        expect(screen.queryByText('Ürün bulunamadı.')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('starts on the main image and switches to a clicked thumbnail without duplicating it', () => {
        renderDetail();

        const thumbnails = screen.getAllByRole('button').filter(b => b.querySelector('img'));
        expect(thumbnails).toHaveLength(2);

        const mainImage = () => screen.getByAltText('Baltık Damla Tesbih') as HTMLImageElement;
        expect(mainImage().src).toBe('https://example.com/main.jpg');

        fireEvent.click(thumbnails[1]);
        expect(mainImage().src).toBe('https://example.com/second.jpg');
    });

    it('omits the thumbnail strip when the product has no extra images', () => {
        renderDetail({ products: [product({ id: '1', name: 'Tek Görselli Tesbih' })] });

        expect(screen.queryByAltText('Resim 1')).not.toBeInTheDocument();
    });

    it('adds to cart and toggles the favorite state of the shown product', () => {
        const { onAddToCart, onToggleFavorite } = renderDetail();

        fireEvent.click(screen.getByRole('button', { name: /SEPETE EKLE/ }));
        fireEvent.click(screen.getByText('favorite'));

        expect(onAddToCart).toHaveBeenCalledWith(PRODUCT);
        expect(onToggleFavorite).toHaveBeenCalledWith(PRODUCT);
    });

    it('marks the favorite button as filled for a favorited product', () => {
        renderDetail({ favorites: [PRODUCT] });

        expect(screen.getByText('favorite').className).toContain('fill-1');
    });
});
