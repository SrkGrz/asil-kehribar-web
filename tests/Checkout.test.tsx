import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Checkout } from '../pages/Checkout';
import { CartItem } from '../types';
import * as api from '../api';
import { cartItem } from './fixtures';

const CART: CartItem[] = [
    cartItem({ id: '1', name: 'Baltık Damla Tesbih', price: 4250, quantity: 2 }),
    cartItem({ id: '2', name: 'Ateş Kehribar Tesbih', price: 1850 })
];

const renderCheckout = ({ cart = CART, onRemove = vi.fn(), clearCart = vi.fn() } = {}) => {
    const utils = render(
        <MemoryRouter>
            <Checkout cart={cart} onRemove={onRemove} clearCart={clearCart} />
        </MemoryRouter>
    );
    return { ...utils, onRemove, clearCart };
};

const fillDeliveryForm = () => {
    fireEvent.change(screen.getByPlaceholderText('Mehmet Yılmaz'), { target: { value: 'Mehmet Yılmaz' } });
    fireEvent.change(screen.getByPlaceholderText('mehmet@example.com'), { target: { value: 'mehmet@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('+90 5XX XXX XX XX'), { target: { value: '+90 555 111 22 33' } });
    fireEvent.change(screen.getByPlaceholderText(/Mahalle, sokak/), { target: { value: 'Kalpakçılar Cd. No:42' } });
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: /GÜVENLİ ÖDEME YAP/ }));

describe('Checkout', () => {
    let fetchApiMock: MockInstance<typeof api.fetchApi>;
    let alertMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchApiMock = vi.spyOn(api, 'fetchApi').mockResolvedValue({ id: 'ORD-ABC123' });
        alertMock = vi.fn();
        vi.stubGlobal('alert', alertMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('sums line totals using quantities', () => {
        renderCheckout();

        // 4250 * 2 + 1850 = 10.350
        expect(screen.getAllByText('₺10.350')).toHaveLength(2);
        expect(screen.getByText('₺8.500')).toBeInTheDocument();
    });

    it('shows the empty basket notice and disables payment for an empty cart', () => {
        renderCheckout({ cart: [] });

        expect(screen.getByText('Sepetiniz Boş')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /GÜVENLİ ÖDEME YAP/ })).toBeDisabled();
        expect(screen.getAllByText('₺0')).toHaveLength(2);
    });

    it('removes a line item through the callback', () => {
        const { onRemove } = renderCheckout();

        fireEvent.click(screen.getAllByText('close')[0]);

        expect(onRemove).toHaveBeenCalledWith('1');
    });

    it('warns instead of posting when delivery details are missing', () => {
        renderCheckout();

        fireEvent.submit(screen.getByRole('button', { name: /GÜVENLİ ÖDEME YAP/ }).closest('form')!);

        expect(alertMock).toHaveBeenCalledWith('Lütfen tüm teslimat bilgilerini doldurun.');
        expect(fetchApiMock).not.toHaveBeenCalled();
    });

    it('posts the order with customer, items and totals', async () => {
        const { clearCart } = renderCheckout();
        fillDeliveryForm();

        submit();

        await waitFor(() => expect(fetchApiMock).toHaveBeenCalledTimes(1));
        const [endpoint, options] = fetchApiMock.mock.calls[0] as [string, RequestInit];
        expect(endpoint).toBe('/api/orders');
        expect(options.method).toBe('POST');
        const payload = JSON.parse(options.body as string);
        expect(payload.customer).toEqual({
            fullName: 'Mehmet Yılmaz',
            email: 'mehmet@example.com',
            phone: '+90 555 111 22 33',
            address: 'Kalpakçılar Cd. No:42'
        });
        expect(payload.items).toHaveLength(2);
        expect(payload.subtotal).toBe(10350);
        expect(payload.total).toBe(10350);
        expect(payload.date).toBeTruthy();
        await waitFor(() => expect(clearCart).toHaveBeenCalledTimes(1));
    });

    it('shows the confirmation screen with the returned order id', async () => {
        renderCheckout();
        fillDeliveryForm();

        submit();

        expect(await screen.findByText('Siparişiniz Alındı!')).toBeInTheDocument();
        expect(screen.getByText('#ORD-ABC123')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'MAĞAZAYA DÖN' })).toBeInTheDocument();
    });

    it('alerts and stays on the form when the order request fails', async () => {
        fetchApiMock.mockRejectedValue(new Error('Stokta yok'));
        const { clearCart } = renderCheckout();
        fillDeliveryForm();

        submit();

        await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Sipariş oluşturulamadı: Stokta yok'));
        expect(clearCart).not.toHaveBeenCalled();
        expect(screen.queryByText('Siparişiniz Alındı!')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /GÜVENLİ ÖDEME YAP/ })).toBeEnabled();
    });

    it('disables the submit button while the order is in flight', async () => {
        let resolveOrder: (value: unknown) => void = () => { };
        fetchApiMock.mockReturnValue(new Promise(resolve => { resolveOrder = resolve; }));
        renderCheckout();
        fillDeliveryForm();

        submit();

        await waitFor(() => expect(screen.getByRole('button', { name: /İŞLENİYOR/ })).toBeDisabled());
        resolveOrder({ id: 'ORD-XYZ' });
        expect(await screen.findByText('Siparişiniz Alındı!')).toBeInTheDocument();
    });
});
