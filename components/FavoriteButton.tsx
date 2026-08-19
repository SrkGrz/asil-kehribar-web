import React from 'react';

export type FavoriteButtonVariant = 'overlay' | 'card' | 'detail';

const VARIANTS: Record<FavoriteButtonVariant, { base: string; active: string; inactive: string; icon: string }> = {
    overlay: {
        base: 'absolute top-8 right-8 z-20 size-12 rounded-2xl flex items-center justify-center transition-all',
        active: 'bg-primary text-stone-950',
        inactive: 'bg-black/20 text-white backdrop-blur-xl hover:bg-white hover:text-stone-950',
        icon: 'text-2xl'
    },
    card: {
        base: 'absolute top-4 right-4 z-10 size-10 rounded-full flex items-center justify-center transition-all',
        active: 'bg-primary text-stone-950 shadow-lg',
        inactive: 'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md text-stone-950 dark:text-white hover:bg-primary hover:text-stone-950',
        icon: 'text-xl'
    },
    detail: {
        base: 'absolute top-6 right-6 size-14 rounded-full flex items-center justify-center shadow-2xl transition-all',
        active: 'bg-primary text-stone-950',
        inactive: 'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md text-stone-950 dark:text-white hover:bg-primary hover:text-stone-950',
        icon: 'text-2xl'
    }
};

interface FavoriteButtonProps {
    isFavorite: boolean;
    onToggle: () => void;
    variant: FavoriteButtonVariant;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorite, onToggle, variant }) => {
    const styles = VARIANTS[variant];
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onToggle();
            }}
            className={`${styles.base} ${isFavorite ? styles.active : styles.inactive}`}
        >
            <span className={`material-symbols-outlined ${styles.icon} ${isFavorite ? 'fill-1' : ''}`}>
                favorite
            </span>
        </button>
    );
};
