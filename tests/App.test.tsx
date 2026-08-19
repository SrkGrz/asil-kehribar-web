import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { product } from './fixtures';

const fetchApiMock = vi.fn();
vi.mock('../api', () => ({ fetchApi: (...args: unknown[]) => fetchApiMock(...args) }));

const PRODUCTS = [
    product({ id: '1', name: 'Baltık Damla Tesbih', price: 4250 }),
    product({ id: '2', name: 'Ateş Kehribar Tesbih', price: 1850 })
];

const { default: App } = await import('../App');

const renderAppAt = async (path: string) => {
    window.history.pushState({}, '', path);
    const utils = render(<App />);
    await waitFor(() => expect(screen.getAllByRole('link', { name: /Tesbih/ }).length).toBeGreaterThan(0));
    return utils;
};

const cartBadge = () => screen.getByTitle('Sepet').querySelector('span:not(.material-symbols-outlined)');
const favBadge = () => screen.getByTitle('Favorilerim').querySelector('span:not(.material-symbols-outlined)');
const addToCartButtons = () => screen.getAllByText('shopping_cart').map(icon => icon.closest('button')!);
const favoriteButtons = () =>
    screen
        .getAllByText('favorite')
        .map(icon => icon.closest('button'))
        .filter((button): button is HTMLButtonElement => button !== null);

describe('App cart and favorites state', () => {
    beforeEach(() => {
        fetchApiMock.mockImplementation((endpoint: string) => {
            if (endpoint === '/api/products') return Promise.resolve(PRODUCTS);
            return Promise.resolve(null);
        });
    });

    afterEach(() => {
        fetchApiMock.mockReset();
    });

    it('loads products through the api on mount', async () => {
        await renderAppAt('/shop');

        expect(fetchApiMock).toHaveBeenCalledWith('/api/products');
        expect(fetchApiMock).toHaveBeenCalledWith('/api/settings');
    });

    it('shows no badges before anything is added', async () => {
        await renderAppAt('/shop');

        expect(cartBadge()).toBeNull();
        expect(favBadge()).toBeNull();
    });

    it('counts quantities rather than lines in the cart badge', async () => {
        await renderAppAt('/shop');

        fireEvent.click(addToCartButtons()[0]);
        expect(cartBadge()).toHaveTextContent('1');

        fireEvent.click(addToCartButtons()[0]);
        expect(cartBadge()).toHaveTextContent('2');

        fireEvent.click(addToCartButtons()[1]);
        expect(cartBadge()).toHaveTextContent('3');
    });

    it('toggles favorites on and off', async () => {
        await renderAppAt('/shop');

        fireEvent.click(favoriteButtons()[0]);
        expect(favBadge()).toHaveTextContent('1');

        fireEvent.click(favoriteButtons()[0]);
        expect(favBadge()).toBeNull();
    });

    it('keeps the cart when navigating to the checkout page', async () => {
        await renderAppAt('/shop');

        fireEvent.click(addToCartButtons()[0]);
        fireEvent.click(addToCartButtons()[0]);
        fireEvent.click(screen.getByTitle('Sepet'));

        expect(await screen.findByText('Sipariş Özeti')).toBeInTheDocument();
        expect(screen.getAllByText('₺8.500').length).toBeGreaterThan(0);
    });

    it('falls back to the default settings and blog posts when the api is unreachable', async () => {
        fetchApiMock.mockImplementation((endpoint: string) =>
            endpoint === '/api/products' ? Promise.resolve(PRODUCTS) : Promise.reject(new Error('offline'))
        );

        await renderAppAt('/shop');
        fireEvent.click(screen.getByRole('link', { name: 'Blog' }));

        expect(await screen.findByText('Gerçek Kehribar Nasıl Anlaşılır?')).toBeInTheDocument();
    });
});
