import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Koleksiyoner } from '../pages/Koleksiyoner';
import { Product } from '../types';
import * as api from '../api';
import { product } from './fixtures';

const COLLECTOR = product({ id: 'c1', name: 'Nadir Damla 1950', type: 'Koleksiyoner Ürünü', price: 90000 });
const SHOP_PRODUCT = product({ id: '1', name: 'Baltık Damla Tesbih', price: 4250 });

const renderPage = (
    { products = [COLLECTOR, SHOP_PRODUCT], favorites = [] as Product[], onAddToCart = vi.fn(), onToggleFavorite = vi.fn() } = {}
) => {
    const utils = render(
        <MemoryRouter>
            <Koleksiyoner
                products={products}
                favorites={favorites}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
            />
        </MemoryRouter>
    );
    return { ...utils, onToggleFavorite };
};

const openForm = () => fireEvent.click(screen.getByRole('button', { name: 'KENDİ ÜRÜNÜNÜ EKLE' }));

const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/Nadir Damla/), { target: { value: 'Miras Kehribar' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '12500' } });
    fireEvent.change(screen.getByPlaceholderText(/Eserin kısa hikayesi/), { target: { value: 'Dedemden kalma.' } });
};

describe('Koleksiyoner', () => {
    let fetchApiMock: MockInstance<typeof api.fetchApi>;

    beforeEach(() => {
        fetchApiMock = vi.spyOn(api, 'fetchApi').mockResolvedValue({});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('only shows products of the collector type', () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'Nadir Damla 1950' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Baltık Damla Tesbih' })).not.toBeInTheDocument();
    });

    it('shows the empty state when no collector shared a piece yet', () => {
        renderPage({ products: [SHOP_PRODUCT] });

        expect(screen.getByText(/Henüz koleksiyonerler tarafından eklenen eser bulunmuyor/)).toBeInTheDocument();
    });

    it('toggles a favorite for the shown collector piece', () => {
        const { onToggleFavorite } = renderPage();

        fireEvent.click(screen.getByText('favorite'));

        expect(onToggleFavorite).toHaveBeenCalledWith(COLLECTOR);
    });

    it('opens and closes the submission modal', async () => {
        renderPage();

        openForm();
        expect(screen.getByRole('heading', { name: 'Eserinizi Ekleyin' })).toBeInTheDocument();

        fireEvent.click(screen.getByText('close'));
        // AnimatePresence keeps the modal mounted until its exit animation finishes.
        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Eserinizi Ekleyin' })).not.toBeInTheDocument());
    });

    it('posts the submitted piece as a collector product with a generated id', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        renderPage();
        openForm();
        fillForm();

        fireEvent.click(screen.getByRole('button', { name: 'SİSTEME KAYDET' }));

        await waitFor(() => expect(fetchApiMock).toHaveBeenCalledTimes(1));
        const [endpoint, options] = fetchApiMock.mock.calls[0] as [string, RequestInit];
        expect(endpoint).toBe('/api/products');
        expect(options.method).toBe('POST');
        const payload = JSON.parse(options.body as string);
        expect(payload).toMatchObject({
            name: 'Miras Kehribar',
            price: 12500,
            description: 'Dedemden kalma.',
            type: 'Koleksiyoner Ürünü'
        });
        expect(payload.id).toMatch(/^[a-z0-9]+$/);
        expect(await screen.findByText('Ürününüz başarıyla incelenmek üzere gönderildi!')).toBeInTheDocument();
        vi.useRealTimers();
    });

    it('alerts and keeps the form open when the submission fails', async () => {
        const alertMock = vi.fn();
        vi.stubGlobal('alert', alertMock);
        fetchApiMock.mockRejectedValue(new Error('Sunucu hatası'));
        renderPage();
        openForm();
        fillForm();

        fireEvent.click(screen.getByRole('button', { name: 'SİSTEME KAYDET' }));

        await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Hata: Sunucu hatası'));
        expect(screen.getByRole('button', { name: 'SİSTEME KAYDET' })).toBeEnabled();
    });
});
