export const upsertById = <T extends { id: string }>(items: T[], item: T): T[] =>
    items.some(existing => existing.id === item.id)
        ? items.map(existing => (existing.id === item.id ? item : existing))
        : [...items, item];

export const removeById = <T extends { id: string }>(items: T[], id: string): T[] =>
    items.filter(item => item.id !== id);
