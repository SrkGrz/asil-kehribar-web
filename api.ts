export class ApiError extends Error {
    status: number;
    payload?: unknown;
    body?: string;

    constructor(message: string, status: number, payload?: unknown, body?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
        this.body = body;
    }
}

const parseResponseBody = async (response: Response): Promise<{ payload?: unknown; body: string }> => {
    const body = await response.text();
    if (!body.trim()) return { body };

    try {
        return { payload: JSON.parse(body), body };
    } catch {
        return { body };
    }
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const token = localStorage.getItem('asil_auth_token');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let response: Response;
    try {
        response = await fetch(endpoint, { ...options, headers });
    } catch (error) {
        console.error(`API isteği başarısız (${endpoint}):`, error);
        throw new ApiError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.', 0, error);
    }

    const parsed = await parseResponseBody(response);
    if (!response.ok) {
        if (response.status === 401) localStorage.removeItem('asil_auth_token');
        const payloadError = parsed.payload && typeof parsed.payload === 'object' && 'error' in parsed.payload
            ? (parsed.payload as { error?: unknown }).error
            : undefined;
        const message = typeof payloadError === 'string' && payloadError
            ? payloadError
            : parsed.body.trim() || response.statusText || `HTTP ${response.status}`;
        throw new ApiError(message, response.status, parsed.payload, parsed.body);
    }

    if (response.status === 204 || !parsed.body.trim()) return undefined;
    return parsed.payload ?? parsed.body;
};
