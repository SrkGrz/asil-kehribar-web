import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no layout engine, so ScrollToTop would log "Not implemented" on every route change.
window.scrollTo = () => { };

afterEach(() => {
    cleanup();
    localStorage.clear();
});
