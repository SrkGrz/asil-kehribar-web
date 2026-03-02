
import React from 'react';
import { Link } from 'react-router-dom';

export const Returns: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-24">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-black italic mb-4 text-stone-950 dark:text-white">İade ve Değişim</h1>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        <p className="mt-6 text-stone-500 font-medium">Kehribar Koleksiyonum olarak müşteri memnuniyeti ve güveni en büyük önceliğimizdir.</p>
      </div>

      <div className="space-y-12 bg-white dark:bg-stone-950 p-8 lg:p-16 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <section className="space-y-4">
          <h2 className="text-2xl font-black italic flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined">assignment_return</span>
            14 Günlük İade Hakkı
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Satın aldığınız ürünü, teslim aldığınız tarihten itibaren <strong>14 gün</strong> içerisinde hiçbir gerekçe göstermeksizin iade edebilirsiniz. İade sürecini başlatmak için <strong>info@kehribarkoleksiyonum.com</strong> adresine e-posta göndermeniz veya iletişim formunu doldurmanız yeterlidir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black italic flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined">verified</span>
            İade ve Değişim Şartları
          </h2>
          <ul className="space-y-4 text-stone-600 dark:text-stone-400 list-disc pl-5">
            <li>Ürünün orijinallik sertifikası ve faturası ile birlikte gönderilmesi zorunludur.</li>
            <li>Kehribar hassas bir malzeme olduğundan, ürünün kullanılmamış, hasar görmemiş ve orijinal kutusunda olması gerekmektedir.</li>
            <li>Habbeleri zedelenmiş, ipi koparılmış veya üzerinde parfümeri/kimyasal kalıntısı olan ürünlerin iadesi kabul edilememektedir.</li>
            <li>Özel tasarım (isime özel gümüş işleme vb.) ürünlerde, üretim hatası olmadığı sürece iade ve değişim yapılamamaktadır.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black italic flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined">local_shipping</span>
            Kargo ve Gönderim
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Ayıplı veya yanlış gönderilen ürünlerin iade kargo ücreti tarafımıza aittir. Keyfi iadelerde kargo ücreti müşterilerimiz tarafından karşılanmaktadır. Ürün tarafımıza ulaştıktan sonraki <strong>3 iş günü</strong> içerisinde inceleme tamamlanır ve onaylanırsa iade süreci başlatılır.
          </p>
        </section>

        <section className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-8 text-center">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6">Sorularınız mı var?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="bg-stone-950 dark:bg-zinc-100 text-white dark:text-stone-950 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              DESTEK ALIN
            </Link>
            <Link to="/shop" className="bg-primary text-stone-950 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              MAĞAZAYA DÖN
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-16 flex items-center justify-center gap-8 opacity-40 grayscale">
         <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
         <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
         <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="Paypal" />
      </div>
    </div>
  );
};
