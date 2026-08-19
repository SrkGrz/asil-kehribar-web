import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchApi } from '../api';

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
    new Response(JSON.stringify(body), { status: 200, ...init });

describe('fetchApi', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const lastHeaders = () => new Headers(fetchMock.mock.calls[0][1].headers);

    it('returns the parsed json body', async () => {
        fetchMock.mockResolvedValue(jsonResponse([{ id: '1' }]));

        await expect(fetchApi('/api/products')).resolves.toEqual([{ id: '1' }]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe('/api/products');
    });

    it('always sends a json content type', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}));

        await fetchApi('/api/products');

        expect(lastHeaders().get('Content-Type')).toBe('application/json');
    });

    it('attaches the stored auth token as a bearer header', async () => {
        localStorage.setItem('asil_auth_token', 'tok-123');
        fetchMock.mockResolvedValue(jsonResponse({}));

        await fetchApi('/api/orders');

        expect(lastHeaders().get('Authorization')).toBe('Bearer tok-123');
    });

    it('omits the authorization header when no token is stored', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}));

        await fetchApi('/api/orders');

        expect(lastHeaders().has('Authorization')).toBe(false);
    });

    it('keeps caller supplied headers and options', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}));

        await fetchApi('/api/orders', {
            method: 'POST',
            body: '{"a":1}',
            headers: { 'X-Custom': 'yes' }
        });

        const [, options] = fetchMock.mock.calls[0];
        expect(options.method).toBe('POST');
        expect(options.body).toBe('{"a":1}');
        expect(lastHeaders().get('X-Custom')).toBe('yes');
    });

    it('throws the server provided error message on a failed response', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ error: 'Hatalı e-posta veya şifre' }, { status: 401 }));

        await expect(fetchApi('/api/auth/login')).rejects.toThrow('Hatalı e-posta veya şifre');
    });

    it('falls back to a generic message when the error body has no error field', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ message: 'nope' }, { status: 500 }));

        await expect(fetchApi('/api/products')).rejects.toThrow('Bilinmeyen bir hata oluştu');
    });

    it('falls back to a generic message when the error body is not json', async () => {
        fetchMock.mockResolvedValue(new Response('<html>502</html>', { status: 502 }));

        await expect(fetchApi('/api/products')).rejects.toThrow('Bilinmeyen bir hata oluştu');
    });

    it('propagates network failures', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(fetchApi('/api/products')).rejects.toThrow('Failed to fetch');
    });
});
