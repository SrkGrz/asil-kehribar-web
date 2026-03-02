
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

export const AIConsultant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hoş geldiniz. Ben Asil Kehribar uzman danışmanıyım. Nadide koleksiyonumuz, kehribar türleri veya yatırım değeri taşıyan eserlerimiz hakkında size asil bir rehberlik sunmak için buradayım. Size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Sen Asil Kehribar markasının uzman danışmanısın.
          Karakterin: Rafine, bilgili, nazik ve seçkin.
          Marka Değerleri:
          - Asil Kehribar sadece %100 gerçek Baltık Kehribarı ve usta işi döküm kehribarlar sunar.
          - Ürünlerimiz ömür boyu orijinallik garantisi altındadır.
          - Müşterilerimiz bizim için birer "Koleksiyoncu"dur.
          Bilgi Notları:
          - Damla Kehribar: En asil ve en eski form, tamamen doğal çam reçinesidir.
          - Zanaatkar Serisi: Türkiye'nin en iyi ustalarının torna tezgahından çıkan imzalı eserler.
          Cevaplarında "Siz" dilini kullan ve her zaman uzmanlığını hissettir. Gereksiz samimiyetten kaçın, "Asil" bir duruş sergile.`,
        },
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'Üzgünüm, şu an bilgi sistemlerimde bir asalet güncellemesi yapılıyor. Lütfen daha sonra tekrar deneyiniz.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Bağlantımızda geçici bir aksama oldu, asil bir sabırla beklediğiniz için teşekkürler.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[100] size-16 rounded-2xl bg-stone-950 text-primary shadow-3xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-primary/20"
      >
        <span className="material-symbols-outlined text-3xl">{isOpen ? 'close' : 'neurology'}</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-8 z-[100] w-[380px] max-w-[90vw] h-[550px] bg-white dark:bg-white rounded-[2rem] shadow-3xl border border-zinc-200 dark:border-zinc-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-stone-50 p-8 flex items-center justify-between border-b border-zinc-100">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-stone-950">
                <span className="material-symbols-outlined">concierge</span>
              </div>
              <div>
                <h3 className="font-display font-black text-stone-950 leading-none italic">Asil Danışman</h3>
                <p className="text-[9px] text-primary uppercase font-black tracking-widest mt-1.5">Expert Concierge</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-stone-50/30 dark:bg-stone-50/30">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-2xl text-[13px] leading-relaxed font-medium ${
                  m.role === 'user' 
                    ? 'bg-stone-950 text-white dark:bg-stone-900 dark:text-white rounded-tr-none' 
                    : 'bg-white dark:bg-white text-zinc-800 dark:text-stone-900 shadow-sm border border-zinc-100 dark:border-zinc-200 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-white p-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center border border-zinc-100 dark:border-zinc-200">
                  <div className="size-1 bg-primary rounded-full animate-pulse"></div>
                  <div className="size-1 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="size-1 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-zinc-100 dark:border-zinc-100 bg-white dark:bg-white">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Bir soru sorun..."
                className="w-full bg-stone-100 dark:bg-stone-50 border-none rounded-xl py-4 pl-5 pr-14 text-sm focus:ring-1 focus:ring-primary transition-all font-medium text-stone-950"
              />
              <button 
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-10 bg-primary text-stone-950 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
