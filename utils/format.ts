const TR_LOCALE = 'tr-TR';

export const formatPrice = (value: number) => `₺${value.toLocaleString(TR_LOCALE)}`;

export const formatTrDate = (date: Date = new Date()) =>
    date.toLocaleDateString(TR_LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });

export const formatTrDateTime = (date: Date = new Date()) =>
    date.toLocaleDateString(TR_LOCALE, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
