import { CartItem, Product } from '../types';

export const product = (overrides: Partial<Product> & { id: string; name: string }): Product => ({
    type: 'Damla (Baltık)',
    price: 1000,
    image: 'https://example.com/a.jpg',
    specs: 'Gümüş Kamçı',
    color: '#fdd835',
    size: '9x13mm',
    description: 'Açıklama',
    longDescription: 'Uzun açıklama',
    ...overrides
});

export const cartItem = (overrides: Partial<CartItem> & { id: string; name: string }): CartItem => ({
    quantity: 1,
    ...product(overrides)
});
