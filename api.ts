export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('asil_auth_token');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(endpoint, { ...options, headers });
    if (!response.ok) {
        let err = 'Bilinmeyen bir hata oluştu';
        try {
            const data = await response.json();
            err = data.error || err;
        } catch { }
        throw new Error(err);
    }
    return response.json();
};
