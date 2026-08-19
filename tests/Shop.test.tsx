import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Shop } from '../pages/Shop';
import { Product } from '../types';
import { product } from './fixtures';

const PRODUCTS: Product[] = [
    product({ id: '1', name: 'Baltık Damla Tesbih', price: 4250 }),
    product({ id: '2', name: 'Ateş Kehribar Tesbih', type: 'Ateş Kehribar', price: 1850, isNew: true }),
    product({ id: '3', name: 'Sıkma Kehribar Tesbih', type: 'Sıkma Kehribar', price: 2400, specs: 'Kazaziye kamçı' }),
    product({ id: '4', name: 'Koleksiyonluk Nadide Parça', type: 'Koleksiyoner Ürünü', price: 90000 })
];

const renderShop = (
    { route = '/shop', products = PRODUCTS, isLoading = false, favorites = [] as Product[], onAddToCart = vi.fn(), onToggleFavorite = vi.fn() } = {}
) => {
    const utils = render(
        <MemoryRouter initialEntries={[route]}>
            <Shop
                products={products}
                isLoading={isLoading}
                favorites={favorites}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
            />
        </MemoryRouter>
    );
    return { ...utils, onAddToCart, onToggleFavorite };
};

const productNames = () =>
    screen
        .getAllByRole('link')
        .filter(link => link.getAttribute('href')?.startsWith('/product/') && link.textContent)
        .map(link => link.textContent);

describe('Shop', () => {
    it('hides collector-only products from the default listing', () => {
        renderShop();

        expect(productNames()).toEqual([
            'Baltık Damla Tesbih',
            'Ateş Kehribar Tesbih',
            'Sıkma Kehribar Tesbih'
        ]);
    });

    it('shows a type filter for every product type and narrows the listing', () => {
        renderShop();

        fireEvent.click(screen.getByRole('radio', { name: 'Koleksiyoner Ürünü' }));

        expect(productNames()).toEqual(['Koleksiyonluk Nadide Parça']);
    });

    it('filters by the q search param across name, specs and description', () => {
        renderShop({ route: '/shop?q=kazaziye' });

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('"kazaziye" için Sonuçlar');
        expect(screen.getByText('1 ürün bulundu.')).toBeInTheDocument();
        expect(productNames()).toEqual(['Sıkma Kehribar Tesbih']);
    });

    it('matches the search param case-insensitively', () => {
        renderShop({ route: '/shop?q=ATEŞ' });

        expect(productNames()).toEqual(['Ateş Kehribar Tesbih']);
    });

    it('sorts by price ascending and descending', () => {
        renderShop();
        const select = screen.getByRole('combobox');

        fireEvent.change(select, { target: { value: 'price-asc' } });
        expect(productNames()).toEqual([
            'Ateş Kehribar Tesbih',
            'Sıkma Kehribar Tesbih',
            'Baltık Damla Tesbih'
        ]);

        fireEvent.change(select, { target: { value: 'price-desc' } });
        expect(productNames()).toEqual([
            'Baltık Damla Tesbih',
            'Sıkma Kehribar Tesbih',
            'Ateş Kehribar Tesbih'
        ]);
    });

    it('sorts by name and puts new arrivals first', () => {
        renderShop();
        const select = screen.getByRole('combobox');

        fireEvent.change(select, { target: { value: 'name-asc' } });
        expect(productNames()).toEqual([
            'Ateş Kehribar Tesbih',
            'Baltık Damla Tesbih',
            'Sıkma Kehribar Tesbih'
        ]);

        fireEvent.change(select, { target: { value: 'newest' } });
        expect(productNames()![0]).toBe('Ateş Kehribar Tesbih');
    });

    it('renders the empty state when nothing matches the search', () => {
        renderShop({ route: '/shop?q=zümrüt' });

        expect(screen.getByText('Sonuç Bulunamadı')).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /Tesbih/ })).not.toBeInTheDocument();
    });

    it('shows skeletons instead of products while loading', () => {
        renderShop({ isLoading: true });

        expect(screen.queryAllByRole('link', { name: /Tesbih/ })).toHaveLength(0);
        expect(screen.queryByText('Sonuç Bulunamadı')).not.toBeInTheDocument();
    });

    it('shows the discounted original price only when present', () => {
        renderShop({ products: [product({ id: '9', name: 'İndirimli Tesbih', price: 5200, originalPrice: 6500 })] });

        expect(screen.getByText('₺6.500')).toBeInTheDocument();
        expect(screen.getByText('₺5.200')).toBeInTheDocument();
    });

    it('reports the clicked product to the cart and favorite callbacks', () => {
        const { onAddToCart, onToggleFavorite } = renderShop({ products: [PRODUCTS[0]] });

        fireEvent.click(screen.getByText('shopping_cart'));
        fireEvent.click(screen.getByText('favorite'));

        expect(onAddToCart).toHaveBeenCalledWith(PRODUCTS[0]);
        expect(onToggleFavorite).toHaveBeenCalledWith(PRODUCTS[0]);
    });

    it('marks already favorited products as filled', () => {
        renderShop({ products: [PRODUCTS[0]], favorites: [PRODUCTS[0]] });

        expect(screen.getByText('favorite').className).toContain('fill-1');
    });
});
