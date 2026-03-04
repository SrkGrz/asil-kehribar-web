
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { fetchApi } from '../api';

interface KoleksiyonerProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    favorites: Product[];
    onToggleFavorite: (product: Product) => void;
}

export const Koleksiyoner: React.FC<KoleksiyonerProps> = ({ products, onAddToCart, favorites, onToggleFavorite }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        price: 0,
        type: 'Koleksiyoner Ürünü',
        description: '',
        image: '',
        specs: '',
        size: '',
        color: '#000000',
        longDescription: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const collectorProducts = products.filter(p => p.type === 'Koleksiyoner Ürünü');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const id = Math.random().toString(36).substr(2, 9);
            const newProduct = { ...formData, id } as Product;
            await fetchApi('/api/products', { method: 'POST', body: JSON.stringify(newProduct) });
            setSuccessMessage('Ürününüz başarıyla incelenmek üzere gönderildi!');
            setFormData({ name: '', price: 0, type: 'Koleksiyoner Ürünü', description: '', image: '', specs: '', size: '', color: '#000000', longDescription: '' });
            setTimeout(() => {
                setSuccessMessage('');
                setIsFormOpen(false);
                window.location.reload(); // Refresh to see new product or just rely on parent state update if possible
            }, 3000);
        } catch (err: any) {
            alert('Hata: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block"
                    >
                        Topluluk Koleksiyonu
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-5xl md:text-7xl font-black text-stone-950 dark:text-white italic mb-8"
                    >
                        Koleksiyonerler <span className="text-primary not-italic font-medium">Kulübü</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-stone-500 text-lg md:text-xl font-medium leading-relaxed"
                    >
                        Kendi nadir parçalarınızı sergileyin, hikayenizi paylaşın ve diğer tutkunlarla buluşun.
                        Her parça bir mirastır.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => setIsFormOpen(true)}
                        className="mt-12 bg-stone-950 dark:bg-primary text-white dark:text-stone-950 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-all"
                    >
                        KENDİ ÜRÜNÜNÜ EKLE
                    </motion.button>
                </div>

                {/* Collector Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {collectorProducts.length > 0 ? (
                        collectorProducts.map(product => (
                            <div key={product.id} className="group relative aspect-[4/5] overflow-hidden bg-zinc-50 dark:bg-stone-900 border border-zinc-100 dark:border-zinc-800 shadow-sm rounded-3xl transition-all hover:shadow-2xl">
                                <img src={product.image || undefined} className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" alt={product.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-10 flex flex-col justify-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Koleksiyoner Paylaşımı</span>
                                    <h3 className="font-display text-3xl text-white font-bold mb-4 italic">{product.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-white italic">₺{product.price.toLocaleString('tr-TR')}</span>
                                        <button
                                            onClick={() => onAddToCart(product)}
                                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-stone-950 transition-all"
                                        >
                                            DETAYI GÖR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[3rem]">
                            <span className="material-symbols-outlined text-6xl text-stone-300 mb-6">inventory_2</span>
                            <p className="text-stone-400 font-medium italic">Henüz koleksiyonerler tarafınan eklenen eser bulunmuyor.</p>
                        </div>
                    )}
                </div>

                {/* Submission Form Modal */}
                <AnimatePresence>
                    {isFormOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFormOpen(false)}
                                className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 md:p-12">
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="font-display text-4xl font-black italic">Eserinizi Ekleyin</h2>
                                        <button onClick={() => setIsFormOpen(false)} className="size-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-primary transition-colors">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>

                                    {successMessage ? (
                                        <div className="py-20 text-center">
                                            <div className="size-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-6">
                                                <span className="material-symbols-outlined text-4xl">check</span>
                                            </div>
                                            <p className="text-xl font-bold italic">{successMessage}</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">ESER ADI</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl p-4 font-bold text-sm focus:ring-1 focus:ring-primary transition-all"
                                                        placeholder="Örn: 1950'lerden Nadir Damla"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">FİYAT (₺)</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                        className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl p-4 font-bold text-sm focus:ring-1 focus:ring-primary transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">AÇIKLAMA</label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl p-4 font-medium text-sm focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="Eserin kısa hikayesi..."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">GÖRSEL</label>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex-grow cursor-pointer bg-stone-50 dark:bg-stone-800 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl p-8 hover:border-primary transition-all flex flex-col items-center gap-2">
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                        <span className="material-symbols-outlined text-stone-300">add_photo_alternate</span>
                                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">RESİM SEÇ</span>
                                                    </label>
                                                    {formData.image && (
                                                        <img src={formData.image} className="size-24 rounded-2xl object-cover shadow-lg" alt="Preview" />
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                disabled={isSubmitting}
                                                type="submit"
                                                className="w-full bg-primary text-stone-950 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'GÖNDERİLİYOR...' : 'SİSTEME KAYDET'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
