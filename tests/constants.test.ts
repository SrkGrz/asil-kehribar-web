import { describe, it, expect } from 'vitest';
import {
    DEFAULT_SLIDES,
    MOCK_PRODUCTS,
    DEFAULT_SETTINGS,
    DEFAULT_BLOG_POSTS,
    MOCK_ORDERS,
    MOCK_CUSTOMERS
} from '../constants';

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/.test(value);
const uniqueIds = (items: { id: string }[]) => new Set(items.map(i => i.id)).size === items.length;

describe('DEFAULT_SLIDES', () => {
    it('has unique ids', () => {
        expect(uniqueIds(DEFAULT_SLIDES)).toBe(true);
    });

    it('has every field the carousel renders', () => {
        expect(DEFAULT_SLIDES.length).toBeGreaterThan(0);
        for (const slide of DEFAULT_SLIDES) {
            expect(slide.title.trim()).not.toBe('');
            expect(slide.subtitle.trim()).not.toBe('');
            expect(slide.tag.trim()).not.toBe('');
            expect(isHttpUrl(slide.image)).toBe(true);
        }
    });

    it('is sorted the same way App sorts slides coming from the API', () => {
        const sorted = [...DEFAULT_SLIDES].sort((a, b) => (a.id > b.id ? 1 : -1));
        expect(DEFAULT_SLIDES.map(s => s.id)).toEqual(sorted.map(s => s.id));
    });
});

describe('MOCK_PRODUCTS', () => {
    it('has unique ids', () => {
        expect(uniqueIds(MOCK_PRODUCTS)).toBe(true);
    });

    it('has positive prices and http image urls', () => {
        expect(MOCK_PRODUCTS.length).toBeGreaterThan(0);
        for (const product of MOCK_PRODUCTS) {
            expect(product.price).toBeGreaterThan(0);
            expect(Number.isFinite(product.price)).toBe(true);
            expect(isHttpUrl(product.image)).toBe(true);
        }
    });

    it('only advertises discounts where the original price is higher', () => {
        for (const product of MOCK_PRODUCTS.filter(p => p.originalPrice !== undefined)) {
            expect(product.originalPrice!).toBeGreaterThan(product.price);
        }
    });

    it('uses hex colors for the swatches', () => {
        for (const product of MOCK_PRODUCTS) {
            expect(product.color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
        }
    });

    it('fills the text fields used by the shop and detail pages', () => {
        for (const product of MOCK_PRODUCTS) {
            expect(product.name.trim()).not.toBe('');
            expect(product.type.trim()).not.toBe('');
            expect(product.size.trim()).not.toBe('');
            expect(product.specs.trim()).not.toBe('');
            expect(product.description.trim()).not.toBe('');
            expect(product.longDescription.trim()).not.toBe('');
        }
    });

    it('never marks a product as both new and special', () => {
        for (const product of MOCK_PRODUCTS) {
            expect(product.isNew && product.isSpecial).toBeFalsy();
        }
    });

    it('has at least one product outside the collector-only type so the shop is never empty', () => {
        expect(MOCK_PRODUCTS.some(p => p.type !== 'Koleksiyoner Ürünü')).toBe(true);
    });
});

describe('DEFAULT_SETTINGS', () => {
    it('holds a valid contact email and instagram url', () => {
        expect(DEFAULT_SETTINGS.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
        expect(isHttpUrl(DEFAULT_SETTINGS.instagram)).toBe(true);
    });

    it('has no empty values', () => {
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
            expect(value.trim(), `${key} should not be empty`).not.toBe('');
        }
    });
});

describe('DEFAULT_BLOG_POSTS', () => {
    it('has unique ids and populated content', () => {
        expect(uniqueIds(DEFAULT_BLOG_POSTS)).toBe(true);
        for (const post of DEFAULT_BLOG_POSTS) {
            expect(post.title.trim()).not.toBe('');
            expect(post.excerpt.trim()).not.toBe('');
            expect(post.content.length).toBeGreaterThan(post.excerpt.length);
            expect(isHttpUrl(post.image)).toBe(true);
            expect(post.date.trim()).not.toBe('');
        }
    });
});

describe('admin mock fixtures', () => {
    it('keep unique ids', () => {
        expect(uniqueIds(MOCK_ORDERS)).toBe(true);
        expect(uniqueIds(MOCK_CUSTOMERS)).toBe(true);
    });

    it('format totals in lira and keep customer emails valid', () => {
        for (const order of MOCK_ORDERS) {
            expect(order.total.startsWith('₺')).toBe(true);
        }
        for (const customer of MOCK_CUSTOMERS) {
            expect(customer.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
            expect(customer.spent.startsWith('₺')).toBe(true);
            expect(customer.orders).toBeGreaterThan(0);
        }
    });
});
